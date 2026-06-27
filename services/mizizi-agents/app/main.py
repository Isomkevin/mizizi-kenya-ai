from fastapi import FastAPI

from app.handlers import (
    handle_climate_job,
    handle_coop_job,
    handle_mobile_money_job,
    handle_orchestrator_job,
)
from app.jobs import job_store
from app.mip003 import build_mip003_router

CLIMATE_SCHEMA = {
    "input_data": [
        {"id": "farmer_id", "type": "string", "name": "Farmer ID", "required": True},
        {"id": "county", "type": "string", "name": "County", "required": True},
        {"id": "lat", "type": "string", "name": "Latitude", "required": True},
        {"id": "lon", "type": "string", "name": "Longitude", "required": True},
    ]
}

COOP_SCHEMA = {
    "input_data": [
        {"id": "farmer_id", "type": "string", "name": "Farmer ID", "required": True},
        {"id": "cooperative", "type": "string", "name": "Cooperative name", "required": True},
        {"id": "cooperative_id", "type": "string", "name": "Cooperative ID", "required": False},
    ]
}

MOBILE_SCHEMA = {
    "input_data": [
        {"id": "farmer_id", "type": "string", "name": "Farmer ID", "required": True},
        {"id": "consent_token", "type": "string", "name": "Consent token", "required": True},
    ]
}

ORCHESTRATOR_SCHEMA = {
    "input_data": [
        {"id": "farmer_id", "type": "string", "name": "Farmer ID", "required": True},
        {"id": "county", "type": "string", "name": "County", "required": True},
        {"id": "lat", "type": "string", "name": "Latitude", "required": True},
        {"id": "lon", "type": "string", "name": "Longitude", "required": True},
        {"id": "cooperative", "type": "string", "name": "Cooperative", "required": False},
        {"id": "cooperative_id", "type": "string", "name": "Cooperative ID", "required": False},
        {"id": "gap_types", "type": "string", "name": "Comma-separated gap ids", "required": True},
    ]
}


def create_app() -> FastAPI:
    app = FastAPI(
        title="Mizizi Masumi Agents",
        description="MIP-003 agentic services for Mizizi data enrichment",
        version="1.0.0",
    )

    job_store.register_handler("mizizi-climate-data", handle_climate_job)
    job_store.register_handler("mizizi-coop-data", handle_coop_job)
    job_store.register_handler("mizizi-mpesa-proxy", handle_mobile_money_job)
    job_store.register_handler("mizizi-orchestrator", handle_orchestrator_job)

    app.include_router(
        build_mip003_router("mizizi-climate-data", CLIMATE_SCHEMA),
        prefix="/climate",
    )
    app.include_router(
        build_mip003_router("mizizi-coop-data", COOP_SCHEMA),
        prefix="/coop",
    )
    app.include_router(
        build_mip003_router("mizizi-mpesa-proxy", MOBILE_SCHEMA),
        prefix="/mobile",
    )
    app.include_router(
        build_mip003_router("mizizi-orchestrator", ORCHESTRATOR_SCHEMA),
        prefix="/orchestrator",
    )

    @app.get("/health")
    async def health() -> dict:
        return {"status": "ok", "agents": ["climate", "coop", "mobile", "orchestrator"]}

    return app


app = create_app()
