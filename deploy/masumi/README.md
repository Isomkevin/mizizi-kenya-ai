# Mizizi Masumi — deploy bundle

Everything needed to run and deploy **Masumi agents** lives in this folder. The Mizizi web app (TanStack Start) stays at the repo root and connects via env vars.

## Layout

```text
deploy/masumi/
├── render.yaml          ← Render Blueprint (use this path explicitly)
├── docker-compose.yml   ← Local agents on :8088
├── .env.example
├── README.md
├── agents/              ← Python MIP-003 FastAPI service
│   ├── Dockerfile
│   └── app/
├── payment/             ← Payment Node env template (Railway/Docker)
└── scripts/             ← wait / env helpers
```

## Render deploy (step-by-step)

> **Important:** Use **New → Blueprint**, not **New → Web Service → Docker**.  
> `render.yaml` is infrastructure-as-code, not a Dockerfile.  
> If you see `unknown instruction: services:`, delete the bad service and re-apply the Blueprint.

Full guide: **[docs/masumi-deploy.md](../../docs/masumi-deploy.md)**.

Render does **not** auto-detect `render.yaml` in subfolders. You must set the blueprint path.

1. Push repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect repository **mizizi-kenya-ai**.
4. When prompted for **Blueprint file path** (or **Root Directory** / **render.yaml path**), enter:

   ```text
   deploy/masumi/render.yaml
   ```

5. Click **Apply**. Render creates:
   - **mizizi-masumi-agents** — Docker web service (Python agents)
   - **mizizi-masumi-orchestrator** — cron (optional; needs Mizizi web URL)

6. After deploy, open the agents service URL and verify:

   ```text
   https://mizizi-masumi-agents.onrender.com/health
   https://mizizi-masumi-agents.onrender.com/climate/availability
   ```

7. Set **Environment** on `mizizi-masumi-agents`:

   | Variable | Example |
   | -------- | ------- |
   | `MIZIZI_CALLBACK_URL` | `https://your-mizizi-app.com` |
   | `MIZIZI_CALLBACK_SECRET` | same secret as Mizizi web `MASUMI_CALLBACK_SECRET` |
   | `MASUMI_MODE` | `demo` or `live` |
   | `PAYMENT_SERVICE_URL` | `https://payment-host/api/v1` (live only) |
   | `PAYMENT_API_KEY` | from Payment admin (live only) |

8. On your **Mizizi web** deployment (separate), set:

   | Variable | Example |
   | -------- | ------- |
   | `MASUMI_AGENTS_URL` | `https://mizizi-masumi-agents.onrender.com` |
   | `MASUMI_CALLBACK_SECRET` | shared secret |
   | `MASUMI_MODE` | `demo` or `live` |

9. Register agents on Masumi Payment Node (Preprod) with `apiBaseUrl` = agents URL + mount:
   - `…/climate`, `…/coop`, `…/mobile`, `…/orchestrator`

10. For the **cron** job, set `MIZIZI_WEB_URL` and `MASUMI_CALLBACK_SECRET` on `mizizi-masumi-orchestrator`.

## Local dev

From repo root:

```bash
bun run masumi:local
bun run dev
```

Or from this folder:

```bash
docker compose up -d --build
curl http://localhost:8088/health
```

## Payment Node (Preprod)

See `payment/.env.example` and [Masumi Payment Service](https://github.com/masumi-network/masumi-payment-service). Deploy on Railway (recommended), not inside this blueprint.

## Mizizi app integration

Server-side Masumi bridge remains in `src/server/services/masumi/`. This folder only ships the **agent runtime** and **Render infra** for it.

Full product runbook: [docs/masumi.md](../../docs/masumi.md)
