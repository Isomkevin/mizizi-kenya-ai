# Build phase status

Last updated: 2026-06-27

Track progress here so any agent (Cursor, Lovable, Copilot, etc.) can pick up where the last session left off. Update this file when you complete a milestone.

## Phase overview

| Phase | Scope                                           | Status      |
| ----- | ----------------------------------------------- | ----------- |
| 1     | Design system, landing page, app route scaffold | **Done**    |
| 2     | Enterprise app shell + dashboard                | **Done**    |
| 3     | Farmer intelligence                             | **Done**    |
| 4     | Graph intelligence workspace                    | **Done**    |
| 5     | Explainability workspace                        | **Done**    |
| 6     | Analytics platform                              | **Done**    |

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

**Next agent task:** Wire remaining server integrations (Supabase auth, Neo4j live graph) as backend milestones land.

## Out of scope (until requested)

- Backend / Lovable Cloud persistence
- Authentication
- Real ML models (use curated mock explainability payloads)

## Technical debt / notes

- Analytics geographic tab uses simplified GeoJSON choropleth; dashboard map remains schematic SVG.
- Server RPC entry points live in `src/api/functions/` (TanStack import protection blocks client imports from `src/server/**`).
- `routeTree.gen.ts` is auto-generated; never edit by hand.
