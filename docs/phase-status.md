# Build phase status

Last updated: 2026-06-27

Track progress here so any agent (Cursor, Lovable, Copilot, etc.) can pick up where the last session left off. Update this file when you complete a milestone.

## Phase overview

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Design system, landing page, app route scaffold | **Done** |
| 2 | Enterprise app shell + dashboard | **Done** |
| 3 | Farmer intelligence | Not started |
| 4 | Graph intelligence workspace | Not started |
| 5 | Explainability workspace | Not started |
| 6 | Analytics platform | Not started |

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
- [x] Mock data in `src/lib/mock/dashboard.ts`, `search.ts`, `types.ts`

**Next agent task:** Start Phase 3 — farmer intelligence per [product-spec.md § Farmer Intelligence](product-spec.md) and [.lovable/plan.md](../.lovable/plan.md).

## Phase 3 — Not started

Farmer search, profile tabs (Overview, Graph, Explainability, Timeline, Documents, Communications). See product spec § Farmer Intelligence.

## Phase 4 — Not started

Force-directed graph canvas. Add `react-force-graph-2d` when starting this phase.

## Phase 5 — Not started

Explainability workspace with decision summary, factor waterfall, officer decision UI.

## Phase 6 — Not started

Analytics platform with Recharts: executive, lending, geographic, climate, graph, explainability views.

## Out of scope (until requested)

- Backend / Lovable Cloud persistence
- Authentication
- Real ML models (use curated mock explainability payloads)

## Technical debt / notes

- Kenya map uses schematic SVG counties for Phase 2; replace with GeoJSON drill-down in Phase 6 geographic analytics.
- `routeTree.gen.ts` is auto-generated; never edit by hand.
