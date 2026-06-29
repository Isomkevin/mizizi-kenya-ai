# Masumi production deploy — Render + Preprod Payment Node

End-to-end guide for deploying Mizizi’s Masumi **agents** on Render and optionally enabling **live** Cardano Preprod payments. Mizizi web and Masumi agents are **separate** deploy units.

**Start here after reading [README.md](./README.md).**

Related:

- [ENV.md](./ENV.md) — environment variable reference
- [payment/README.md](./payment/README.md) — Payment Node (Preprod)
- [agents/README.md](./agents/README.md) — MIP-003 endpoints and registration URLs
- [../../docs/masumi.md](../../docs/masumi.md) — product integration, local scripts, API

---

## Architecture

```text
┌─────────────────────┐     MASUMI_AGENTS_URL      ┌──────────────────────────┐
│  Mizizi web         │ ─────────────────────────► │  mizizi-masumi-agents    │
│  (Lovable/Vercel/   │                            │  (Render Docker)         │
│   Render root)      │ ◄───────────────────────── │  agents/                 │
└─────────────────────┘   POST /api/webhooks/      └────────────┬─────────────┘
                          masumi-callback                        │
                                                                 │ live only
                                                                 ▼
                                                    ┌──────────────────────────┐
                                                    │  Masumi Payment Node     │
                                                    │  (Railway / self-host)   │
                                                    │  Cardano Preprod         │
                                                    └──────────────────────────┘
```

| Component | Deploy target | Config in this folder |
| --------- | ------------- | --------------------- |
| Python MIP-003 agents | Render | `blueprint.yaml`, `agents/` |
| Mizizi TanStack app | Lovable / Vercel / Render (repo root) | Not in this blueprint |
| Payment Node | Railway (recommended) | `payment/.env.example` |
| Orchestrator cron | Render (optional) | `blueprint.yaml` |

---

## Demo vs live

| Mode | Payment Node | On-chain tx | Use case |
| ---- | ------------ | ----------- | -------- |
| `demo` | Not required | Synthetic hashes | Demos, hackathons, dev |
| `live` | Required (Preprod) | Real USDM escrow | Preprod integration testing |

Start with **`MASUMI_MODE=demo`**. Switch to `live` only after the Payment Node is funded and agents are registered.

---

## Step 1 — Deploy agents on Render (Blueprint)

### Critical: use Blueprint, not Docker Web Service

If Render logs show:

```text
load build definition from render.yaml
dockerfile parse error: unknown instruction: envVarGroups:
```

Render is building the **Blueprint YAML** as a **Dockerfile**. See **[RENDER.md](./RENDER.md)** for the exact dashboard fix.

You likely created **Web Service → Docker** with Dockerfile Path set to `render.yaml` or `blueprint.yaml` instead of using **New → Blueprint**.

**Fix:**

1. Delete the misconfigured service (or disconnect it from this repo).
2. Render Dashboard → **New** → **Blueprint** (not “Web Service”).
3. Connect your GitHub repo.
4. Set **Blueprint file path** to:

   ```text
   deploy/masumi/blueprint.yaml
   ```

5. Click **Apply**. Render prompts for env vars marked `sync: false` (see [ENV.md](./ENV.md)).

### What the blueprint creates

| Resource | Type | Purpose |
| -------- | ---- | ------- |
| `mizizi-masumi-agents` | Docker web | Python agents on port 8080 |
| `mizizi-masumi-orchestrator` | Cron (6h) | POST batch orchestrator on Mizizi web |

Docker build uses `deploy/masumi/agents/Dockerfile` — not `blueprint.yaml`.

### Verify agents

```text
GET https://mizizi-masumi-agents.onrender.com/health
GET https://mizizi-masumi-agents.onrender.com/climate/availability
```

Expect `{"status":"ok"}` and MIP-003 availability JSON.

---

## Step 2 — Deploy Mizizi web (separate)

Deploy the TanStack Start app from the **repo root** (Lovable sync, Vercel, or a separate Render Node service). Set env vars per [ENV.md](./ENV.md#mizizi-web).

Agents POST to `{MIZIZI_CALLBACK_URL}/api/webhooks/masumi-callback` with header `x-mizizi-callback-secret`.

---

## Step 3 — Payment Node (Preprod, live mode only)

**Mizizi Payment Node:** https://masumi-payment-service-production-7ec9.up.railway.app/  
API: `https://masumi-payment-service-production-7ec9.up.railway.app/api/v1`

Follow [payment/README.md](./payment/README.md).

Verify:

```bash
export PAYMENT_SERVICE_URL=https://masumi-payment-service-production-7ec9.up.railway.app/api/v1
export PAYMENT_API_KEY=your-admin-key

curl -sS "$PAYMENT_SERVICE_URL/health" | jq
curl -sS "$PAYMENT_SERVICE_URL/api-key-status" -H "token: $PAYMENT_API_KEY" | jq
```

---

## Step 4 — Register agents (live mode)

Use registration URLs from [agents/README.md](./agents/README.md). Set `MASUMI_MODE=live` on **both** agents and Mizizi web. Redeploy if needed.

---

## Step 5 — Smoke test

1. Open Mizizi → `/app/analytics?tab=agents` — all agents **available**, payment connected (live).
2. Open a farmer profile → **Request missing data** on a climate/coop gap.
3. Confirm job completes; farmer data updates; optional on-chain hash in job detail (live).

---

## Troubleshooting

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| `unknown instruction: envVarGroups:` | Blueprint YAML used as Dockerfile | Delete service; see [RENDER.md](./RENDER.md); use Blueprint path `deploy/masumi/blueprint.yaml` |
| Agents unavailable in analytics | `MASUMI_AGENTS_URL` wrong or agents sleeping | Check URL; wake Render service; hit `/health` |
| Webhook 401 | Secret mismatch | Align `MIZIZI_CALLBACK_SECRET` (agents) and `MASUMI_CALLBACK_SECRET` (web) |
| Payment not connected (live) | Wrong URL/key or unfunded wallets | Check `/health` and `/api-key-status`; fund Preprod wallets |
| Jobs stuck RUNNING | Agent can’t reach callback URL | Ensure `MIZIZI_CALLBACK_URL` is public HTTPS, not localhost |
| Blueprint path not found | Wrong path in dashboard | Must be exactly `deploy/masumi/blueprint.yaml` |

---

## Local parity

See [LOCAL.md](./LOCAL.md).
