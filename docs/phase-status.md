# Build phase status

Last updated: 2026-06-27

Track progress here so any agent (Cursor, Lovable, Copilot, etc.) can pick up where the last session left off. Update this file when you complete a milestone.

## Phase overview

| Phase | Scope                                           | Status   |
| ----- | ----------------------------------------------- | -------- |
| 0     | Full-stack foundation (auth/schema/seed/BFF)    | **Done** |
| 1     | Design system, landing page, app route scaffold | **Done** |
| 2     | Enterprise app shell + dashboard                | **Done** |
| 3     | Farmer intelligence                             | **Done** |
| 4     | Graph intelligence workspace                    | **Done** |
| 5     | Explainability workspace                        | **Done** |
| 6     | Analytics platform                              | **Done** |
| 7     | Masumi agentic data collection                  | **Done** |

## Phase 0 — Done

- [x] `.env.example` documents Supabase, Neo4j, Featherless, OpenRouter, tenant and AI runtime variables
- [x] Supabase migration with tenant RLS in `supabase/migrations/001_initial_schema.sql`
- [x] Neo4j constraints in `scripts/neo4j/001_constraints.cypher`
- [x] BFF server-function surface in `src/api/functions/*`
- [x] Seed pipeline resets data, syncs graph entities, and primes climate snapshots

## Phase 1 — Done

- [x] Brand tokens and typography in `src/styles.css`
- [x] Landing page at `/` with editorial sections (`src/routes/index.tsx`, `src/components/landing/`)
- [x] App layout with sidebar nav at `/app` (`src/routes/app.tsx`)
- [x] Placeholder routes: farmers, graph, analytics, portfolio, climate, decisions

## Phase 2 — Done

- [x] Sidebar navigation with active states
- [x] Dashboard route at `/app` with KPI cards and insight feed (`src/routes/app.index.tsx`)
- [x] Command bar + global search (⌘K) per spec (`src/components/app/GlobalSearch.tsx`)
- [x] Full enterprise header layout (`src/components/app/AppHeader.tsx`, `AppSidebar.tsx`)
- [x] Risk distribution charts on dashboard (`RiskDistributionChart.tsx` + Recharts)
- [x] Geographic intelligence — schematic Kenya map (`KenyaMap.tsx`)
- [x] Recent activity feed and quick actions
- [x] Dashboard migrated to `useDashboard()` hooks

## Phase 3 — Done

- [x] Farmer search at `/app/farmers` with filters, result cards, `useFarmers`
- [x] Farmer profile at `/app/farmers/$farmerId` with tabs (overview, financial, climate, applications, decisions, documents, activity)
- [x] Create farmer flow + profile routing (`CreateFarmerDialog`, nested `/app/farmers` routes)
- [x] Document ingestion on profile Documents tab: drag-and-drop upload, automatic classification (Featherless → OpenRouter → rules), officer confirm/reclassify gate, background Neo4j/local graph sync on confirmation
- [x] Components in `src/components/app/farmers/`

## Phase 4 — Done

- [x] Graph workspace at `/app/graph` with `react-force-graph-2d`, toolbar, sidebar, legend, path viewer
- [x] `farmerId` query param support via `useGraph`

## Phase 5 — Done

- [x] Pending decisions queue at `/app/decisions`
- [x] Decision workspace at `/app/decisions/$decisionId`
- [x] Components in `src/components/app/decisions/`

## Phase 6 — Done

- [x] Tabbed analytics at `/app/analytics` (executive, lending, geographic, climate, graph, explainability)
- [x] `/app/portfolio` and `/app/climate` redirect to analytics tabs
- [x] `src/assets/geo/kenya-counties.json` + `AnalyticsMap` choropleth

## Phase 2 migration — Done

- [x] Dashboard components use `useDashboard()`
- [x] `GlobalSearch` uses `useGlobalSearch()` / server search fn
- [x] Minimal auth via `AuthProvider` + `/app` route guard (dev bypass)

## Phase 7 — Masumi agentic data collection — Done (2026-06-27)

- [x] Python MIP-003 agents (`services/mizizi-agents/`) — climate, coop, mobile, orchestrator
- [x] TypeScript `masumi-service` — dispatch, poll, webhook, consent, job store
- [x] Officer enrichment → Masumi dispatch; consent workflow on farmer profile
- [x] HTTP routes: `/api/webhooks/masumi-callback`, `/api/agents/status`, orchestrator cron
- [x] Analytics **Masumi agents** tab; Docker Compose + Render blueprint
- [x] `docs/masumi.md` runbook

## Next priorities

- Harden production Supabase auth session flows (replace dev bypass in production runtime)
- Add decision pipeline tests for risk/explanation grounding and audit transitions

## Neo4j integration — Done (2026-06-27)

- [x] Neo4j-first `getGraph` reads with local cache fallback
- [x] Fixed subgraph node/edge ID mapping for force-graph canvas
- [x] Verified `graphEvidence` on decision factors (Cypher paths + local fallback)
- [x] Async risk engine enriched with live graph metrics (degree, documents, optional GDS trust)
- [x] Grounded explanations cite verified graph evidence; insufficient-data guard per PRD
- [x] Graph workspace depth control (1–3) and data-source badge
- [x] Extended constraints for Document, FarmParcel, DataSource
- [x] Optional GDS PageRank script + seed-time refresh when plugin available
- [x] Local Docker Neo4j (`docker-compose.neo4j.yml`, `bun run neo4j:local`)
- [x] Aura setup path (`bun run neo4j:aura`, `.env.neo4j.aura.example`)
- [x] Env merge helpers (`bun run neo4j:env:local` / `neo4j:env:aura`)
- [x] Graph UI Neo4j connection status (`GraphConnectionStatus` on `/app/graph`)
- [x] `docs/neo4j.md` — local + Aura runbooks

## Technical debt / notes

- Analytics geographic tab uses GeoJSON county polygons; dashboard map remains a lightweight schematic for at-a-glance status.
- Fallback payloads remain hook-level only (`src/api/hooks/fallback-data.ts`) and are not consumed directly by UI components.
- Server RPC entry points live in `src/api/functions/` (TanStack import protection blocks client imports from `src/server/**`).
- `routeTree.gen.ts` is auto-generated; never edit by hand.
