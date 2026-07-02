# Lovable demo deployment

Quick checklist for [mizizi-kenya-ai.lovable.app](https://mizizi-kenya-ai.lovable.app/) with **no Supabase**, **Aura graph**, and seeded demo data.

## Lovable secrets (Project → Settings → Environment)

```env
MIZIZI_TENANT_ID=lesom-sandbox
MIZIZI_USE_LOCAL_STORE=true
VITE_MIZIZI_DEMO=true

# Do NOT set VITE_SUPABASE_* or SUPABASE_* for the demo bypass

NEO4J_PROFILE=aura
NEO4J_URI=neo4j+s://YOUR_INSTANCE.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-aura-password
NEO4J_DATABASE=neo4j
NEO4J_GDS=false

MASUMI_MODE=disabled

# ZK Credit Rails — demo mode (no Stellar secrets required)
ZK_MODE=demo
```

Optional (document AI on farmer profiles):

```env
FEATHERLESS_API_KEY=...
OPENROUTER_API_KEY=...
```

## One-time Aura seed (from your machine)

```bash
bun run neo4j:env:aura
# paste Aura credentials into .env
bun run neo4j:aura
```

## Push code

Lovable syncs from the connected Git branch. Commit and push fixes, then wait for rebuild.

## Verify

| URL | Expected |
| --- | -------- |
| `/app` | Dashboard loads (no redirect to `/`) |
| `/app/decisions` | Pending applications list |
| `/app/decisions/dec-f-002` | Decision workspace — ZK credential gate before approve |
| `/app/farmers/f-002` | Peter Ochieng — generate ZK credential on Financial tab |
| `/app/farmers/f-001` | Wanjiru Kamau profile |
| `/app/graph?farmerId=f-001` | Graph canvas; **Source: neo4j** when Aura is wired |

## Notes

- **Auth:** `VITE_MIZIZI_DEMO=true` (or empty Supabase vars) keeps the officer dev session on production.
- **Data:** Local store uses in-memory seed on serverless; each worker cold start reloads seed data (fine for demos).
- **Masumi:** Disable on Lovable (`MASUMI_MODE=disabled`); deploy agents via `deploy/masumi/blueprint.yaml` if needed later.
- **ZK:** `ZK_MODE=demo` runs Groth16 prove locally and skips Soroban tx (no `STELLAR_FUNDER_SECRET` needed).
