from __future__ import annotations

import httpx

from app.config import settings
from app.hashing import input_data_to_dict
from app.jobs import JobRecord


async def fetch_climate(county: str, lat: float, lon: float) -> dict:
    url = settings.open_meteo_base
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,wind_speed_10m",
        "daily": "precipitation_sum",
        "timezone": "Africa/Nairobi",
        "forecast_days": "1",
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    rainfall = (data.get("daily") or {}).get("precipitation_sum", [0])[0] or 0
    current = data.get("current") or {}
    drought_probability = max(0.0, min(1.0, 1 - rainfall / 40))
    return {
        "county": county,
        "lat": lat,
        "lon": lon,
        "rainfallMm": rainfall,
        "temperatureC": current.get("temperature_2m", 0),
        "windSpeedMs": current.get("wind_speed_10m", 0),
        "droughtProbability": round(drought_probability, 2),
        "source": "open-meteo",
    }


async def handle_climate_job(record: JobRecord) -> dict:
    params = input_data_to_dict(record.input_data)
    county = params.get("county", "Nairobi")
    lat = float(params.get("lat", "-1.2864"))
    lon = float(params.get("lon", "36.8172"))
    farmer_id = params.get("farmer_id", "")

    climate = await fetch_climate(county, lat, lon)
    tx = f"preprod_{record.job_id}_{record.input_hash[:16]}"
    return {
        "enrichType": "CLIMATE",
        "farmer_id": farmer_id,
        "county": county,
        "climate": climate,
        "data_source_id": f"ds-climate-{farmer_id}-{record.job_id}",
        "masumi_tx_hash": tx,
        "masumi_hash": record.input_hash,
    }


async def handle_coop_job(record: JobRecord) -> dict:
    params = input_data_to_dict(record.input_data)
    farmer_id = params.get("farmer_id", "")
    cooperative = params.get("cooperative", "Unknown Cooperative")
    cooperative_id = params.get("cooperative_id", f"coop-{farmer_id}")

    repayments = [
        {
            "id": f"rep-{farmer_id}-1",
            "date": "2025-11-15",
            "amountKes": 12500,
            "onTime": True,
        },
        {
            "id": f"rep-{farmer_id}-2",
            "date": "2026-02-10",
            "amountKes": 11800,
            "onTime": True,
        },
    ]
    loans = [
        {
            "id": f"loan-{farmer_id}",
            "amountKes": 45000,
            "status": "active",
            "season": "LR2026",
        }
    ]
    tx = f"preprod_{record.job_id}_{record.input_hash[:16]}"
    return {
        "enrichType": "COOPERATIVE",
        "farmer_id": farmer_id,
        "cooperative": cooperative,
        "cooperative_id": cooperative_id,
        "repayments": repayments,
        "loans": loans,
        "avg_repayment_rate": 0.92,
        "data_source_id": f"ds-coop-{farmer_id}-{record.job_id}",
        "masumi_tx_hash": tx,
        "masumi_hash": record.input_hash,
    }


async def handle_mobile_money_job(record: JobRecord) -> dict:
    params = input_data_to_dict(record.input_data)
    farmer_id = params.get("farmer_id", "")
    tx = f"preprod_{record.job_id}_{record.input_hash[:16]}"
    return {
        "enrichType": "MOBILE_MONEY",
        "farmer_id": farmer_id,
        "monthly_inflow_kes": 18500,
        "monthly_outflow_kes": 14200,
        "regularity_score": 0.78,
        "data_source_id": f"ds-mobile-{farmer_id}-{record.job_id}",
        "masumi_tx_hash": tx,
        "masumi_hash": record.input_hash,
    }


async def handle_orchestrator_job(record: JobRecord) -> dict:
    params = input_data_to_dict(record.input_data)
    farmer_id = params.get("farmer_id", "")
    gap_types = [g.strip() for g in params.get("gap_types", "climate_zone,repayment").split(",") if g.strip()]
    dispatched: list[dict] = []

    agent_map = {
        "climate_zone": ("climate", ["county", "lat", "lon", "farmer_id"]),
        "repayment": ("coop", ["farmer_id", "cooperative", "cooperative_id"]),
        "cooperative": ("coop", ["farmer_id", "cooperative", "cooperative_id"]),
        "mobile_activity": ("mobile", ["farmer_id"]),
    }

    base_url = f"http://127.0.0.1:{settings.port}"
    async with httpx.AsyncClient(timeout=60.0) as client:
        for gap in gap_types:
            route, keys = agent_map.get(gap, ("climate", ["farmer_id", "county", "lat", "lon"]))
            input_data = [{"key": k, "value": params.get(k, "")} for k in keys if params.get(k)]
            if "farmer_id" not in [i["key"] for i in input_data]:
                input_data.append({"key": "farmer_id", "value": farmer_id})

            start = await client.post(
                f"{base_url}/{route}/start_job",
                json={
                    "identifier_from_purchaser": f"{record.identifier_from_purchaser}-{gap}",
                    "input_data": input_data,
                },
            )
            if start.is_success:
                job = start.json()
                dispatched.append({"gap": gap, "agent": route, "job_id": job.get("job_id")})

    tx = f"preprod_{record.job_id}_{record.input_hash[:16]}"
    return {
        "enrichType": "ORCHESTRATION",
        "farmer_id": farmer_id,
        "dispatched": dispatched,
        "masumi_tx_hash": tx,
        "masumi_hash": record.input_hash,
    }
