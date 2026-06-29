# Mizizi Masumi integration

Masumi powers **agentic data collection**: autonomous agents fetch cooperative, climate, and mobile-money signals, record **on-chain audit hashes**, and populate the Mizizi graph.

## Architecture

```text
Officer UI (Request enrichment)
        ↓
TanStack BFF (masumi-service.ts)
        ↓ POST /start_job
Mizizi Agents (Python, MIP-003) — climate · coop · mobile · orchestrator
        ↓ callback
POST /api/webhooks/masumi-callback → apply to farmer + Neo4j DataSource
```

Optional: **Masumi Payment Service** (Cardano Preprod) for live USDM escrow.

## Quick start (demo mode)

Demo mode runs agents immediately with synthetic Preprod tx hashes — no Blockfrost or wallets required.

```bash
# 1. Merge Masumi env vars
bun run masumi:env

# 2. Start Python agents (Docker)
bun run masumi:up

# 3. Wait for health, then dev server
bun run masumi:wait
bun run dev
```

Open `/app/analytics?tab=agents` for agent health and job history.

On a farmer profile, use **Request missing data** on the Data completeness panel. Climate and cooperative gaps dispatch Masumi jobs; mobile money requires **Request consent** first.

## Scripts

| Command                       | Description                        |
| ----------------------------- | ---------------------------------- |
| `bun run masumi:env`          | Merge `MASUMI_*` vars into `.env`  |
| `bun run masumi:up`           | Docker Compose — agents on `:8088` |
| `bun run masumi:down`         | Stop agents                        |
| `bun run masumi:wait`         | Block until `/health` OK           |
| `bun run masumi:local`        | env + up + wait (one command)      |
| `bun run masumi:orchestrator` | POST batch orchestrator (cron)     |

## Environment

| Variable                 | Default                 | Purpose                          |
| ------------------------ | ----------------------- | -------------------------------- |
| `MASUMI_MODE`            | `demo`                  | `demo` \| `live` \| `disabled`   |
| `MASUMI_AGENTS_URL`      | `http://localhost:8088` | Python agents base URL           |
| `MASUMI_CALLBACK_SECRET` | dev secret              | Webhook auth header              |
| `MASUMI_PAYMENT_URL`     | —                       | `https://masumi-payment-service-production-7ec9.up.railway.app/api/v1` (live) |
| `MASUMI_PAYMENT_API_KEY` | —                       | Payment service API key          |

Agent path overrides: `MASUMI_CLIMATE_AGENT_PATH`, `MASUMI_COOP_AGENT_PATH`, etc.

## HTTP API (Mizizi server)

| Route                           | Method | Purpose                                            |
| ------------------------------- | ------ | -------------------------------------------------- |
| `/api/agents/status`            | GET    | Agent health + job counts                          |
| `/api/webhooks/masumi-callback` | POST   | Agent delivery webhook                             |
| `/api/agents/orchestrator/run`  | POST   | Cron trigger (requires `x-mizizi-callback-secret`) |

Server functions (TanStack): `getMasumiStatusFn`, `listMasumiJobsFn`, `grantConsentFn`, `runOrchestratorFn`.

## Live mode (Cardano Preprod)

**Mizizi Payment Node (Railway):** https://masumi-payment-service-production-7ec9.up.railway.app/

| Env var | Live value |
| ------- | ---------- |
| `MASUMI_PAYMENT_URL` / `PAYMENT_SERVICE_URL` | `https://masumi-payment-service-production-7ec9.up.railway.app/api/v1` |
| `MASUMI_PAYMENT_API_KEY` / `PAYMENT_API_KEY` | From Payment admin UI (secret) |

1. Open Payment admin at the URL above; create API key if needed.
2. Fund Preprod wallets (ADA + test USDM) via [Masumi faucet](https://faucet.masumi.network).
3. Register agents in admin UI; set `MASUMI_MODE=live` and payment env vars on agents + Mizizi web.
4. Agents call `POST /purchase` when `MASUMI_MODE=live`.

Full wiring: [deploy/masumi/payment/README.md](../deploy/masumi/payment/README.md)

Hosted registry (read-only): `https://registry.masumi.network/api/v1`

## Deployment (Render)

All deploy docs are in **`deploy/masumi/`**:

| Doc | Purpose |
| --- | ------- |
| [deploy/masumi/DEPLOY.md](../deploy/masumi/DEPLOY.md) | Render Blueprint walkthrough |
| [deploy/masumi/ENV.md](../deploy/masumi/ENV.md) | Environment variables |
| [deploy/masumi/README.md](../deploy/masumi/README.md) | Bundle index |

Blueprint path: **`deploy/masumi/blueprint.yaml`** (use Render **Blueprint**, not Docker Web Service). Mizizi web deploys separately.

## Agent endpoints (MIP-003)

Each agent mount exposes:

- `GET /availability`
- `GET /input_schema`
- `POST /start_job`
- `GET /status?job_id=…`

| Mount           | Agent ID              | Capability                        |
| --------------- | --------------------- | --------------------------------- |
| `/climate`      | `mizizi-climate-data` | Open-Meteo climate refresh        |
| `/coop`         | `mizizi-coop-data`    | Cooperative repayment fetch       |
| `/mobile`       | `mizizi-mpesa-proxy`  | Aggregated mobile flows (consent) |
| `/orchestrator` | `mizizi-orchestrator` | Batch gap dispatch                |

## Consent gate

Mobile money enrichment requires `ConsentRecord.status === ACTIVE` for the current season. Officers grant consent from the farmer profile data gaps panel.

## Troubleshooting

| Symptom                             | Fix                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Agents unavailable on analytics tab | Run `bun run masumi:up` and `bun run masumi:wait`                                                       |
| Jobs stuck in RUNNING               | Poll via farmer profile refresh; check agent logs `bun run masumi:logs` |
| Render `unknown instruction: envVarGroups:` | Blueprint YAML used as Dockerfile — see [deploy/masumi/RENDER.md](../deploy/masumi/RENDER.md) |
| Webhook 401                         | Match `MIZIZI_CALLBACK_SECRET` on web + agents                                                          |
| `MASUMI_MODE=disabled`              | Set `MASUMI_MODE=demo` and `MASUMI_AGENTS_URL`                                                          |

Skill reference: `.agents/skills/masumi/SKILL.md`
