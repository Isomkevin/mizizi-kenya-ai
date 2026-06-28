# Masumi environment variables

Reference for Render deploy, local Docker, and Mizizi web wiring.

---

## Naming: agents vs web

| Layer | Payment URL | Payment key |
| ----- | ----------- | ----------- |
| Python agents (Render / Docker) | `PAYMENT_SERVICE_URL` | `PAYMENT_API_KEY` |
| Mizizi web (TypeScript) | `MASUMI_PAYMENT_URL` | `MASUMI_PAYMENT_API_KEY` |

Use the **same values**; only variable names differ.

---

## Render blueprint prompts (`sync: false`)

These are defined in [render.yaml](./render.yaml). Render asks for values when you **Apply** the Blueprint.

### `mizizi-masumi-agents`

| Variable | Required | Example | Notes |
| -------- | -------- | ------- | ----- |
| `MIZIZI_CALLBACK_URL` | Yes | `https://your-mizizi-app.com` | No trailing slash |
| `MIZIZI_CALLBACK_SECRET` | Yes | strong random string | Must match Mizizi web `MASUMI_CALLBACK_SECRET` |
| `PAYMENT_SERVICE_URL` | Live only | `https://payment.up.railway.app/api/v1` | From Payment Node |
| `PAYMENT_API_KEY` | Live only | Payment admin key | From Payment Node |
| `MASUMI_PAYMENT_URL` | Live only | same as `PAYMENT_SERVICE_URL` | Copy to Mizizi web |
| `MASUMI_PAYMENT_API_KEY` | Live only | same as `PAYMENT_API_KEY` | Copy to Mizizi web |
| `MASUMI_MODE` | No | `demo` (default in blueprint) | Set `live` for Preprod |
| `CARDANO_NETWORK` | No | `Preprod` (default) | |

### `mizizi-masumi-orchestrator`

| Variable | Example |
| -------- | ------- |
| `MIZIZI_WEB_URL` | `https://your-mizizi-app.com` |
| `MASUMI_CALLBACK_SECRET` | same as Mizizi web |
| `MASUMI_AGENTS_URL` | `https://mizizi-masumi-agents.onrender.com` |

---

## Mizizi web

Set on your **separate** Mizizi deployment (repo root — Lovable, Vercel, Render Node):

| Variable | Example |
| -------- | ------- |
| `MASUMI_MODE` | `demo` or `live` |
| `MASUMI_AGENTS_URL` | `https://mizizi-masumi-agents.onrender.com` |
| `MASUMI_CALLBACK_SECRET` | shared secret (same as agents `MIZIZI_CALLBACK_SECRET`) |
| `MASUMI_PAYMENT_URL` | Payment Node `/api/v1` URL (live only) |
| `MASUMI_PAYMENT_API_KEY` | Payment admin key (live only) |

Optional path overrides: `MASUMI_CLIMATE_AGENT_PATH`, `MASUMI_COOP_AGENT_PATH`, etc.

---

## Local development

### Mizizi web (repo root `.env`)

Merged by `bun run masumi:env` from repo root:

| Variable | Default |
| -------- | ------- |
| `MASUMI_MODE` | `demo` |
| `MASUMI_AGENTS_URL` | `http://localhost:8088` |
| `MASUMI_CALLBACK_SECRET` | `mizizi-dev-callback-secret` |

### Agents container

See [.env.example](./.env.example) and [agents/.env.example](./agents/.env.example). Docker Compose maps host `:8088` → container `:8080`.

| Variable | Local default |
| -------- | ------------- |
| `MIZIZI_CALLBACK_URL` | `http://host.docker.internal:5173` |
| `MIZIZI_CALLBACK_SECRET` | `mizizi-dev-callback-secret` |

---

## Payment Node

See [payment/.env.example](./payment/.env.example) and [payment/README.md](./payment/README.md).
