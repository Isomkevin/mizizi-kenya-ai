# Masumi production deploy — Render + Preprod Payment Node

End-to-end guide for deploying Mizizi’s Masumi **agents** on Render and optionally enabling **live** Cardano Preprod payments. Mizizi web and Masumi agents are **separate** deploy units.

Related docs:

- [masumi.md](./masumi.md) — product integration, local demo, API reference
- [deploy/masumi/README.md](../deploy/masumi/README.md) — bundle layout and quick Render steps

---

## Architecture

```text
┌─────────────────────┐     MASUMI_AGENTS_URL      ┌──────────────────────────┐
│  Mizizi web         │ ─────────────────────────► │  mizizi-masumi-agents    │
│  (Lovable/Vercel/   │                            │  (Render Docker)         │
│   Render root)      │ ◄───────────────────────── │  deploy/masumi/agents    │
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

| Component | Deploy target | Blueprint / config |
| --------- | ------------- | ------------------ |
| Python MIP-003 agents | Render | `deploy/masumi/render.yaml` |
| Mizizi TanStack app | Lovable / Vercel / Render (repo root) | Not in Masumi blueprint |
| Payment Node | Railway (recommended) or Docker | `deploy/masumi/payment/.env.example` |
| Orchestrator cron | Render (optional) | Same blueprint |

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
dockerfile parse error: unknown instruction: services:
```

you created a **Docker Web Service** with **Dockerfile Path** set to `render.yaml`. That file is a **Blueprint spec**, not a Dockerfile.

**Fix:**

1. Delete the misconfigured service (or disconnect it from this repo).
2. Render Dashboard → **New** → **Blueprint** (not “Web Service”).
3. Connect `Isomkevin/mizizi-kenya-ai`.
4. Set **Blueprint file path** to:

   ```text
   deploy/masumi/render.yaml
   ```

5. Click **Apply**. Render prompts for env vars marked `sync: false`.

### What the blueprint creates

| Resource | Type | Purpose |
| -------- | ---- | ------- |
| `mizizi-masumi-agents` | Docker web | Python agents on port 8080 |
| `mizizi-masumi-orchestrator` | Cron (6h) | POST batch orchestrator on Mizizi web |

Docker build uses `deploy/masumi/agents/Dockerfile` via `rootDir: deploy/masumi/agents` — not `render.yaml`.

### Env vars prompted at apply time

**On `mizizi-masumi-agents`:**

| Variable | Required | Example | Notes |
| -------- | -------- | ------- | ----- |
| `MIZIZI_CALLBACK_URL` | Yes | `https://your-mizizi-app.com` | No trailing slash |
| `MIZIZI_CALLBACK_SECRET` | Yes | strong random string | Must match Mizizi web |
| `PAYMENT_SERVICE_URL` | Live only | `https://payment.up.railway.app/api/v1` | Agents (Python) |
| `PAYMENT_API_KEY` | Live only | Payment admin key | Agents (Python) |
| `MASUMI_PAYMENT_URL` | Live only | same as `PAYMENT_SERVICE_URL` | Copy to Mizizi web |
| `MASUMI_PAYMENT_API_KEY` | Live only | same as `PAYMENT_API_KEY` | Copy to Mizizi web |
| `MASUMI_MODE` | No | `demo` (default) | Set `live` for Preprod |
| `CARDANO_NETWORK` | No | `Preprod` (default) | |

**On `mizizi-masumi-orchestrator`:**

| Variable | Example |
| -------- | ------- |
| `MIZIZI_WEB_URL` | `https://your-mizizi-app.com` |
| `MASUMI_CALLBACK_SECRET` | same as web |
| `MASUMI_AGENTS_URL` | `https://mizizi-masumi-agents.onrender.com` |

### Verify agents

```text
GET https://mizizi-masumi-agents.onrender.com/health
GET https://mizizi-masumi-agents.onrender.com/climate/availability
```

Expect `{"status":"ok"}` and MIP-003 availability JSON.

---

## Step 2 — Deploy Mizizi web (separate)

Deploy the TanStack Start app from the **repo root** (Lovable sync, Vercel, or a separate Render Node service). Then set:

| Variable | Example |
| -------- | ------- |
| `MASUMI_MODE` | `demo` or `live` |
| `MASUMI_AGENTS_URL` | `https://mizizi-masumi-agents.onrender.com` |
| `MASUMI_CALLBACK_SECRET` | shared secret (same as agents) |
| `MASUMI_PAYMENT_URL` | Payment Node `/api/v1` URL (live only) |
| `MASUMI_PAYMENT_API_KEY` | Payment admin key (live only) |

**Naming:** agents POST to `{MIZIZI_CALLBACK_URL}/api/webhooks/masumi-callback` with header `x-mizizi-callback-secret`.

---

## Step 3 — Payment Node (Preprod, live mode only)

1. Deploy [Masumi Payment Service](https://github.com/masumi-network/masumi-payment-service):
   - **Recommended:** Railway template “Masumi Payment Service”
   - Or Docker with env from `deploy/masumi/payment/.env.example`
2. Create a [Blockfrost](https://blockfrost.io) Preprod API key.
3. Generate three Preprod wallets (purchase, selling, collection) — see Masumi docs.
4. Fund wallets via [Masumi faucet](https://faucet.masumi.network) (ADA + test USDM).
5. Open Payment admin UI → create API key → note `PAYMENT_API_KEY`.
6. Set `PAYMENT_SERVICE_URL` to `https://your-payment-host/api/v1` on agents and `MASUMI_PAYMENT_URL` on Mizizi web (same value).

Verify Payment Node:

```bash
curl -sS "$PAYMENT_SERVICE_URL/health" | jq
curl -sS "$PAYMENT_SERVICE_URL/api-key-status" -H "token: $PAYMENT_API_KEY" | jq
```

---

## Step 4 — Register agents (live mode)

In Payment admin, register each agent with `network: Preprod` and `apiBaseUrl`:

| Agent | apiBaseUrl |
| ----- | ---------- |
| Climate | `{MASUMI_AGENTS_URL}/climate` |
| Cooperative | `{MASUMI_AGENTS_URL}/coop` |
| Mobile money | `{MASUMI_AGENTS_URL}/mobile` |
| Orchestrator | `{MASUMI_AGENTS_URL}/orchestrator` |

Set `MASUMI_MODE=live` on **both** agents and Mizizi web. Redeploy if needed.

---

## Step 5 — Smoke test

1. Open Mizizi → `/app/analytics?tab=agents` — all agents **available**, payment connected (live).
2. Open a farmer profile → **Request missing data** on a climate/coop gap.
3. Confirm job completes; farmer data updates; optional on-chain hash in job detail (live).

---

## Troubleshooting

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| `unknown instruction: services:` | Docker service using `render.yaml` as Dockerfile | Delete service; redeploy via **Blueprint** with path `deploy/masumi/render.yaml` |
| Agents unavailable in analytics | `MASUMI_AGENTS_URL` wrong or agents sleeping | Check URL; wake Render service; hit `/health` |
| Webhook 401 | Secret mismatch | Align `MIZIZI_CALLBACK_SECRET` (agents) and `MASUMI_CALLBACK_SECRET` (web) |
| Payment not connected (live) | Wrong URL/key or unfunded wallets | Check `/health` and `/api-key-status`; fund Preprod wallets |
| Jobs stuck RUNNING | Agent can’t reach callback URL | Ensure `MIZIZI_CALLBACK_URL` is public HTTPS, not localhost |
| Blueprint path not found | Wrong path in dashboard | Must be exactly `deploy/masumi/render.yaml` |

---

## Env var naming reference

| Layer | Payment URL | Payment key |
| ----- | ----------- | ----------- |
| Python agents | `PAYMENT_SERVICE_URL` | `PAYMENT_API_KEY` |
| Mizizi web (TypeScript) | `MASUMI_PAYMENT_URL` | `MASUMI_PAYMENT_API_KEY` |

Use the **same values**; only the variable names differ.

---

## Local parity

```bash
bun run masumi:local   # agents on :8088
bun run dev
```

See [masumi.md](./masumi.md) for scripts and API details.
