from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.config import settings
from app.hashing import canonical_hash, input_data_to_dict
from app.jobs import JobRecord, job_store


class StartJobRequest(BaseModel):
    identifier_from_purchaser: str = Field(min_length=8, max_length=64)
    input_data: list[dict[str, str]]


def build_mip003_router(agent_name: str, input_schema: dict) -> APIRouter:
    router = APIRouter(tags=[agent_name])

    @router.get("/availability")
    async def availability() -> dict:
        active = len([job for job in job_store._jobs.values() if job.agent_name == agent_name])
        return {
            "status": "available",
            "type": "masumi-agent",
            "message": f"{agent_name} is ready to accept jobs",
            "current_load": {"active_jobs": active, "queued_jobs": 0, "max_capacity": 50},
        }

    @router.get("/input_schema")
    async def schema() -> dict:
        return {"status": "success", "input_schema": input_schema}

    @router.get("/demo")
    async def demo() -> dict:
        return {
            "status": "success",
            "example_input": input_schema.get("input_data", []),
            "example_output": {"source": agent_name, "verified": True},
        }

    @router.post("/start_job")
    async def start_job(body: StartJobRequest) -> dict:
        input_hash = canonical_hash(body.input_data)
        blockchain_id = f"masumi_{agent_name}_{body.identifier_from_purchaser[:12]}"

        if settings.masumi_mode == "live" and settings.payment_api_key:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{settings.payment_service_url.rstrip('/')}/purchase",
                        headers={"token": settings.payment_api_key},
                        json={
                            "agentIdentifier": agent_name,
                            "identifierFromPurchaser": body.identifier_from_purchaser,
                            "inputHash": input_hash,
                            "network": "Preprod",
                        },
                    )
                    if response.is_success:
                        payload = response.json()
                        blockchain_id = payload.get("blockchainIdentifier", blockchain_id)
            except Exception:
                pass

        record = job_store.create(
            agent_name=agent_name,
            identifier_from_purchaser=body.identifier_from_purchaser,
            input_data=body.input_data,
            input_hash=input_hash,
            blockchain_identifier=blockchain_id,
        )

        record.status = "running" if settings.masumi_mode == "demo" else "awaiting_payment"
        job_store.schedule(record.job_id)

        return {
            "status": "success",
            "job_id": record.job_id,
            "blockchainIdentifier": record.blockchain_identifier,
            "identifierFromPurchaser": body.identifier_from_purchaser,
            "input_hash": input_hash,
            "agentIdentifier": agent_name,
        }

    @router.get("/status")
    async def status(job_id: str = Query(...)) -> dict:
        record = job_store.get(job_id)
        if not record:
            raise HTTPException(status_code=404, detail="JOB_NOT_FOUND")

        if record.status == "completed" and record.output is not None:
            await _notify_mizizi(record)
            return {
                "status": "completed",
                "job_id": record.job_id,
                "result": record.output,
                "output_hash": record.output_hash,
                "input_hash": record.input_hash,
                "masumi_tx_hash": record.masumi_tx_hash,
                "execution_time_seconds": max(
                    0, int((record.completed_at or 0) - record.created_at)
                ),
            }

        if record.status == "failed":
            return {
                "status": "failed",
                "job_id": record.job_id,
                "error": "PROCESSING_ERROR",
                "message": record.error or "Job failed",
            }

        if record.status == "running":
            return {
                "status": "running",
                "job_id": record.job_id,
                "progress": record.progress,
            }

        return {
            "status": record.status,
            "job_id": record.job_id,
            "blockchainIdentifier": record.blockchain_identifier,
        }

    return router


_notified: set[str] = set()


async def _notify_mizizi(record: JobRecord) -> None:
    if record.job_id in _notified or not settings.mizizi_callback_url:
        return
    _notified.add(record.job_id)
    payload = {
        "job_id": record.job_id,
        "agent_name": record.agent_name,
        "status": record.status,
        "masumi_tx_hash": record.masumi_tx_hash,
        "output_hash": record.output_hash,
        "input_hash": record.input_hash,
        "result": record.output,
        "input": input_data_to_dict(record.input_data),
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            await client.post(
                f"{settings.mizizi_callback_url.rstrip('/')}/api/webhooks/masumi-callback",
                json=payload,
                headers={"x-mizizi-callback-secret": settings.mizizi_callback_secret},
            )
    except Exception:
        pass
