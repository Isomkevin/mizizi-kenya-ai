# Graph model (Phase 0+)

Mizizi models farmer risk context as a multi-entity graph. The graph powers reads (workspace + decisions), optional Neo4j sync, and verified evidence paths.

## Node labels

- `Farmer` — applicant profile, risk and confidence attributes.
- `Cooperative` — producer group membership context (`trustScore` when GDS is available).
- `Loan` — active or pending credit records.
- `InputDealer` — upstream input purchase counterparties.
- `ClimateZone` — county-aligned climate risk context.
- `Document` — officer-uploaded evidence with verification metadata.
- `FarmParcel` — land parcel hectares linked from document extraction.
- `DataSource` — provenance for uploaded documents (`officer_upload`) or Masumi agents (`masumi_agent`, with `masumi_tx_hash`)

## Relationships

- `(:Farmer)-[:MEMBER_OF]->(:Cooperative)`
- `(:Farmer)-[:OWNS_LOAN]->(:Loan)`
- `(:Farmer)-[:PURCHASES_FROM]->(:InputDealer)`
- `(:Farmer)-[:LOCATED_IN]->(:ClimateZone)`
- `(:Farmer)-[:HAS_DOCUMENT]->(:Document)`
- `(:Farmer)-[:HAS_PARCEL]->(:FarmParcel)`
- `(:DataSource)-[:PROVIDED]->(:Document)`
- `(:Cooperative)-[:WORKS_WITH]->(:InputDealer)`

## Identity conventions

- Farmer node IDs mirror API IDs (`f-001`, `f-002`, ...).
- Related entities are derived from farmer IDs for deterministic seeding:
  - Cooperative: `coop-{farmerId}` (or `coop-{slug}` when merged from documents)
  - Loan: `loan-{farmerId}`
  - Input dealer: `dealer-{farmerId}`
  - Climate zone: `zone-{county-slug}`
  - Farm parcel: `parcel-{farmerId}`

## Constraints

Apply Neo4j uniqueness constraints from `scripts/neo4j/001_constraints.cypher` before loading graph data.

Optional GDS PageRank trust scores: `scripts/neo4j/002_gds_optional.cypher` (Aura Pro / self-managed with GDS plugin).

## Query surface

- `getGraphFn` — Neo4j subgraph read when configured (depth 1–3), else local payload; caches to persistence.
- `expandGraphFn` — neighborhood expansion via Neo4j with local fallback.
- `verifyNeo4jFn` — connectivity check for ops.
- Decision factors resolve `graphEvidence` via Cypher per factor `source`, with local graph fallback.
