# Graph model (Phase 0)

Mizizi models farmer risk context as a multi-entity graph. Phase 0 provides the base entity and relationship set used by local graph payloads and optional Neo4j sync.

## Node labels

- `Farmer` - applicant profile, risk and confidence attributes.
- `Cooperative` - producer group membership context.
- `Loan` - active or pending credit records.
- `InputDealer` - upstream input purchase counterparties.
- `ClimateZone` - county-aligned climate risk context.

## Relationships

- `(:Farmer)-[:MEMBER_OF]->(:Cooperative)`
- `(:Farmer)-[:OWNS_LOAN]->(:Loan)`
- `(:Farmer)-[:PURCHASES_FROM]->(:InputDealer)`
- `(:Farmer)-[:LOCATED_IN]->(:ClimateZone)`
- `(:Cooperative)-[:WORKS_WITH]->(:InputDealer)`

## Identity conventions

- Farmer node IDs mirror API IDs (`f-001`, `f-002`, ...).
- Related entities are derived from farmer IDs for deterministic seeding:
  - Cooperative: `coop-{farmerId}`
  - Loan: `loan-{farmerId}`
  - Input dealer: `dealer-{farmerId}`
  - Climate zone: `zone-{county-slug}`

## Constraints

Apply Neo4j uniqueness constraints from `scripts/neo4j/001_constraints.cypher` before loading graph data.

## Query surface

- `getGraphFn` returns stored local graph payload for a farmer.
- `expandGraphFn` resolves neighborhood graph via Neo4j when available, else local fallback.
