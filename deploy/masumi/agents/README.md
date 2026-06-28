# Mizizi Masumi agents — MIP-003 service

Python FastAPI service exposing four MIP-003 agent mounts. Built and deployed via [Dockerfile](./Dockerfile).

---

## Endpoints (each mount)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/availability` | Agent online check |
| GET | `/input_schema` | Job input JSON schema |
| POST | `/start_job` | Dispatch enrichment job |
| GET | `/status?job_id=…` | Poll job status |

Global: `GET /health` → `{"status":"ok"}`

---

## Agent mounts

Replace `{BASE}` with your agents URL (e.g. `https://mizizi-masumi-agents.onrender.com` or `http://localhost:8088`).

| Mount | Agent ID | Capability | Registration `apiBaseUrl` |
| ----- | -------- | ------------ | ------------------------- |
| `/climate` | `mizizi-climate-data` | Open-Meteo climate refresh | `{BASE}/climate` |
| `/coop` | `mizizi-coop-data` | Cooperative repayment fetch | `{BASE}/coop` |
| `/mobile` | `mizizi-mpesa-proxy` | Aggregated mobile flows (consent) | `{BASE}/mobile` |
| `/orchestrator` | `mizizi-orchestrator` | Batch gap dispatch | `{BASE}/orchestrator` |

---

## Local smoke test

```bash
curl http://localhost:8088/health
curl http://localhost:8088/climate/availability
curl http://localhost:8088/coop/input_schema
```

---

## Environment

See [../ENV.md](../ENV.md) and [.env.example](./.env.example).

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `MASUMI_MODE` | `demo` | `demo` \| `live` |
| `MIZIZI_CALLBACK_URL` | — | Mizizi web base URL for webhooks |
| `MIZIZI_CALLBACK_SECRET` | — | Webhook auth header value |
| `PAYMENT_SERVICE_URL` | — | Payment Node `/api/v1` (live) |
| `PAYMENT_API_KEY` | — | Payment admin key (live) |

---

## Docker

```bash
# from deploy/masumi/
docker compose up -d --build
```

Render builds this folder via `rootDir: deploy/masumi/agents` in [../render.yaml](../render.yaml).

Deploy guide: [../DEPLOY.md](../DEPLOY.md)
