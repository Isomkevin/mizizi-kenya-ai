# Infrastructure foundation (Phase 0)

Phase 0 introduces a server-side foundation that runs fully local first, while keeping interfaces compatible with Supabase and Neo4j as those integrations mature.

## Components

- **Local persistence**: JSON database at `.data/mizizi-db.json` via `src/server/db/local-store.ts`.
- **Seed layer**: `src/server/db/seed-data.ts` provides deterministic startup data for dashboard, farmers, graph, decisions, and analytics.
- **Persistence adapter**: `src/server/services/persistence.ts` selects local or Supabase-backed adapter using environment configuration.
- **Climate integration**: `src/server/services/climate.ts` fetches county climate observations from Open-Meteo with in-memory cache.
- **Graph integration**: `src/server/services/neo4j.ts` syncs to Neo4j when configured, otherwise falls back to local graph payloads.
- **Neo4j ops**: `docker-compose.neo4j.yml`, `scripts/neo4j/setup.ts`, `docs/neo4j.md` (local Docker + Aura).
- **Server functions**: `src/server/functions/*` expose typed read/write operations for TanStack Start clients.

## Runtime modes

### Local-first mode (default)

- Enabled when `MIZIZI_USE_LOCAL_STORE=true` or Supabase URL is missing.
- All reads/writes occur against `.data/mizizi-db.json`.
- Neo4j and Supabase services gracefully fall back to local behavior.

### Supabase mode (incremental)

- Enabled when `SUPABASE_URL` + key are configured and local override is disabled.
- Adapter attempts direct table access for `farmers` and `decisions`.
- Unsupported paths still use local fallback to avoid blocking development.

## Data model assets

- SQL baseline: `supabase/migrations/001_initial_schema.sql`
- Neo4j constraints: `scripts/neo4j/001_constraints.cypher`
- Neo4j setup guide: `docs/neo4j.md`
- Local Neo4j: `docker-compose.neo4j.yml` + `bun run neo4j:local`
- Seed command: `scripts/seed/index.ts`

## Environment

Reference `.env.example` for all required server variables.
