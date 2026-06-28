# Mizizi Masumi — deploy bundle

Self-contained folder for **local agents**, **Render Blueprint**, and **Preprod Payment Node** wiring. Mizizi web (TanStack Start) stays at repo root and connects via env vars.

**Render Blueprint path:** `deploy/masumi/blueprint.yaml`

---

## Documentation

| Doc | Purpose |
| --- | ------- |
| **[RENDER.md](./RENDER.md)** | Fix “unknown instruction: envVarGroups” / wrong Dockerfile path |
| **[DEPLOY.md](./DEPLOY.md)** | Production deploy — Render Blueprint, Mizizi web, smoke test, troubleshooting |
| **[ENV.md](./ENV.md)** | All environment variables (Render prompts, web, agents, local) |
| **[LOCAL.md](./LOCAL.md)** | Local Docker dev from repo root |
| **[payment/README.md](./payment/README.md)** | Masumi Payment Node (Preprod, live mode) |
| **[agents/README.md](./agents/README.md)** | MIP-003 endpoints and agent registration URLs |

---

## Layout

```text
deploy/masumi/
├── README.md            ← you are here
├── DEPLOY.md            ← Render production walkthrough
├── ENV.md               ← env var reference
├── LOCAL.md             ← local dev
├── blueprint.yaml       ← Render Blueprint (NOT a Dockerfile)
├── RENDER.md            ← fix Render Docker/Blueprint mistakes
├── docker-compose.yml   ← local agents on :8088
├── .env.example
├── agents/              ← Python MIP-003 FastAPI
│   ├── Dockerfile
│   ├── README.md
│   └── app/
├── payment/             ← Payment Node template
│   ├── README.md
│   └── .env.example
└── scripts/             ← apply-env.ts, wait-agents.ts
```

---

## Render deploy (quick)

> **Use New → Blueprint**, not New → Web Service → Docker.  
> Build error `unknown instruction: envVarGroups:` → see **[RENDER.md](./RENDER.md)**.

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect repo → Blueprint path: **`deploy/masumi/blueprint.yaml`**
3. Apply → fill prompted env vars ([ENV.md](./ENV.md))
4. Verify: `GET https://mizizi-masumi-agents.onrender.com/health`
5. Set `MASUMI_AGENTS_URL` + secrets on Mizizi web ([DEPLOY.md](./DEPLOY.md#step-2--deploy-mizizi-web-separate))

---

## Local dev (quick)

From repo root:

```bash
bun run masumi:local
bun run dev
```

Details: [LOCAL.md](./LOCAL.md)

---

## Mizizi app code

Server-side Masumi bridge: `src/server/services/masumi/` (not in this folder).

Product runbook (UI, API, consent): [../../docs/masumi.md](../../docs/masumi.md)
