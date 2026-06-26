# Project agent skills

Portable [Agent Skills](https://agentskills.io/specification) for Cursor, Lovable, Copilot, Antigravity, and other tools. Each subdirectory contains a `SKILL.md` with YAML frontmatter (`name`, `description`) plus optional `references/` and `scripts/`.

**Lovable:** see [`.lovable/skills.md`](../../.lovable/skills.md).  
**Entry point:** [AGENTS.md](../../AGENTS.md) § Agent skills.

## Usage (all agents)

1. At task start, check whether the request matches any skill `description` below.
2. If yes, read `.agents/skills/<name>/SKILL.md` fully before coding.
3. Load `references/*` only when the skill points to them.

## Mizizi project skills

| Skill | Path | Use when |
| --- | --- | --- |
| `continue-build` | `continue-build/` | Picking up work — read phase status, implement next milestone |
| `add-app-route` | `add-app-route/` | Adding a TanStack Start route under `src/routes/` |
| `masumi` | `masumi/` | Masumi Network, MIP-003, Cardano payments, Sokosumi, Kodosumi |

## Neo4j skills (graph phase)

Installed via `npx skills add neo4j-contrib/neo4j-skills`. Locked in `skills-lock.json`.

| Skill | Use when |
| --- | --- |
| `neo4j-getting-started-skill` | First-time Neo4j / Aura setup |
| `neo4j-aura-provisioning-skill` | Create or manage Aura instances |
| `neo4j-modeling-skill` | Design farmer identity graph, labels, relationships |
| `neo4j-cypher-skill` | Write or optimize Cypher queries |
| `neo4j-gds-skill` | GDS algorithms (Louvain, PageRank, betweenness, etc.) |
| `neo4j-import-skill` | Load CSV/structured data |
| `neo4j-query-tuning-skill` | Slow queries, EXPLAIN, indexes |
| `neo4j-nvl-skill` | Neo4j Visualization Library in the UI |
| `neo4j-graphrag-skill` | GraphRAG retrieval pipelines |
| `neo4j-vector-index-skill` | Vector indexes, semantic search |
| `neo4j-genai-plugin-skill` | In-Cypher LLM / embedding functions |
| `neo4j-agent-memory-skill` | Graph-native agent memory |
| `neo4j-document-import-skill` | KG from PDFs / documents |
| `neo4j-security-skill` | RBAC, auth, privileges |
| `neo4j-graphql-skill` | GraphQL API on Neo4j |
| `neo4j-aura-graph-analytics-skill` | Serverless Aura Graph Analytics |
| `neo4j-aura-agent-skill` | Aura Agents API |
| `neo4j-driver-python-skill` | Python driver |
| `neo4j-driver-java-skill` | Java driver |
| `neo4j-driver-go-skill` | Go driver |
| `neo4j-driver-dotnet-skill` | .NET driver |
| `neo4j-kafka-skill` | Kafka sink / CDC |
| `neo4j-spark-skill` | Spark connector |
| `neo4j-snowflake-graph-analytics-skill` | Graph analytics in Snowflake |

Each skill's full trigger text is in its `SKILL.md` frontmatter `description` field.

## Mirror paths

| Tool | Also scans |
| --- | --- |
| Cursor | `.cursor/skills/` (mirror of this directory) |
| Copilot | `.github/skills/README.md` → points here |
| Lovable | `AGENTS.md`, `.lovable/skills.md`, this index |
