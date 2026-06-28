# Masumi local development

Run Python agents locally via Docker; Mizizi web runs from repo root.

---

## One command

From repo root:

```bash
bun run masumi:local   # merge .env, docker up, wait for /health
bun run dev
```

---

## Step by step

```bash
bun run masumi:env     # merge MASUMI_* into repo root .env
bun run masumi:up      # Docker Compose — agents on :8088
bun run masumi:wait    # block until GET /health OK
bun run dev
```

---

## From this folder

```bash
docker compose up -d --build
curl http://localhost:8088/health
curl http://localhost:8088/climate/availability
```

---

## Scripts (repo root)

| Command | Description |
| ------- | ----------- |
| `bun run masumi:env` | Merge `MASUMI_*` vars into `.env` |
| `bun run masumi:up` | Start agents container |
| `bun run masumi:down` | Stop agents |
| `bun run masumi:logs` | Follow agent logs |
| `bun run masumi:wait` | Wait for `/health` |
| `bun run masumi:local` | env + up + wait |

---

## Verify in UI

- `/app/analytics?tab=agents` — agent health and job history
- Farmer profile → **Request missing data** on data gaps panel

Mobile money enrichment requires officer **consent** first.

---

## Env files

| File | Purpose |
| ---- | ------- |
| [.env.example](./.env.example) | Docker Compose env template |
| [agents/.env.example](./agents/.env.example) | Standalone agent env |
| [ENV.md](./ENV.md) | Full variable reference |

Product API details: [../../docs/masumi.md](../../docs/masumi.md)
