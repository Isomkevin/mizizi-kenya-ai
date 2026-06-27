# Server API (Phase 0)

Phase 0 adds TanStack Start server functions as the primary data access layer for client hooks.

## Dashboard

- `getDashboardFn` (`GET`)  
  Returns `DashboardPayload` with welcome, KPIs, risk bands, insights, activity, quick actions, and county intel.

## Search

- `globalSearchFn` (`GET`, input `{ query, type?, limit? }`)  
  Full-index search across farmers, loans, counties, cooperatives, decisions, and risk IDs.
- `searchFarmersFn` (`GET`, input `{ query, limit? }`)  
  Farmer-focused search returning normalized `SearchResult[]`.

## Farmers

- `getFarmerFn` (`GET`, input `{ id }`)  
  Fetches `FarmerProfile` by internal ID or external farmer ID.

## Graph

- `getGraphFn` (`GET`, input `{ farmerId, depth? }`)
  Returns farmer subgraph from Neo4j when configured (default depth 2), else stored local payload.
- `expandGraphFn` (`GET`, input `{ rootId, depth }`)
  Expands graph neighborhood using Neo4j when configured; otherwise local fallback payload.
- `verifyNeo4jFn` (`GET`)
  Returns Neo4j connectivity status for ops.

## Decisions

- `listDecisionsFn` (`GET`, input `{ status?, limit? }`)
- `getDecisionFn` (`GET`, input `{ id }`)
- `submitDecisionFn` (`POST`, input `{ id, status, recommendation, officerExplanation?, overrideReason? }`)

## Analytics & Climate

- `getAnalyticsFn` (`GET`)  
  Returns aggregate analytics payload.
- `refreshClimateFn` (`POST`, input `{ county, lat, lon }`)  
  Pulls latest county climate observation from Open-Meteo and updates local analytics/farmer climate snapshots.

## Client hooks

Query wrappers are provided under `src/api/hooks/`:

- `use-dashboard.ts`
- `use-search.ts`
- `use-farmers.ts`
- `use-graph.ts`
- `use-decisions.ts`
- `use-analytics.ts`
