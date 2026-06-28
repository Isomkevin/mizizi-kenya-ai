from __future__ import annotations

import asyncio
import secrets
import time
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable


JobHandler = Callable[["JobRecord"], Awaitable[dict[str, Any]]]


@dataclass
class JobRecord:
    job_id: str
    agent_name: str
    identifier_from_purchaser: str
    input_data: list[dict[str, str]]
    status: str = "awaiting_payment"
    progress: dict[str, Any] = field(default_factory=dict)
    output: dict[str, Any] | None = None
    input_hash: str = ""
    output_hash: str = ""
    blockchain_identifier: str = ""
    masumi_tx_hash: str = ""
    error: str | None = None
    created_at: float = field(default_factory=time.time)
    completed_at: float | None = None


class JobStore:
    def __init__(self) -> None:
        self._jobs: dict[str, JobRecord] = {}
        self._handlers: dict[str, JobHandler] = {}

    def register_handler(self, agent_name: str, handler: JobHandler) -> None:
        self._handlers[agent_name] = handler

    def create(
        self,
        agent_name: str,
        identifier_from_purchaser: str,
        input_data: list[dict[str, str]],
        input_hash: str,
        blockchain_identifier: str,
    ) -> JobRecord:
        job_id = secrets.token_hex(8)
        record = JobRecord(
            job_id=job_id,
            agent_name=agent_name,
            identifier_from_purchaser=identifier_from_purchaser,
            input_data=input_data,
            input_hash=input_hash,
            blockchain_identifier=blockchain_identifier,
        )
        self._jobs[job_id] = record
        return record

    def get(self, job_id: str) -> JobRecord | None:
        return self._jobs.get(job_id)

    async def run_job(self, job_id: str) -> None:
        record = self._jobs.get(job_id)
        if not record:
            return
        handler = self._handlers.get(record.agent_name)
        if not handler:
            record.status = "failed"
            record.error = f"No handler for agent {record.agent_name}"
            return

        record.status = "running"
        record.progress = {"current_step": "fetching", "percentage": 10}
        try:
            result = await handler(record)
            record.output = result
            from app.hashing import canonical_hash

            record.output_hash = canonical_hash(result)
            record.masumi_tx_hash = result.get("masumi_tx_hash", f"demo_tx_{job_id}")
            record.status = "completed"
            record.completed_at = time.time()
            record.progress = {"current_step": "done", "percentage": 100}
        except Exception as exc:  # noqa: BLE001
            record.status = "failed"
            record.error = str(exc)
            record.completed_at = time.time()

    def schedule(self, job_id: str) -> None:
        asyncio.create_task(self.run_job(job_id))


job_store = JobStore()
