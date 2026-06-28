# Mizizi documentation

| Document                                                     | Description                                                                 |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [product-spec.md](product-spec.md)                           | Full product requirements document (PRD)                                    |
| [phase-status.md](phase-status.md)                           | Build phase progress and next steps — **update this after every milestone** |
| [neo4j-implementation.md](neo4j-implementation.md)           | **External** Neo4j architecture, graph model, evidence pipeline, deployment |
| [neo4j.md](neo4j.md)                                         | Developer runbook — local Docker, Aura setup, troubleshooting             |
| [graph-model.md](graph-model.md)                             | Graph labels, relationships, and identity conventions (engineering)       |

## Cross-tool handoff

Any AI agent (Cursor, Claude Code, Copilot, Antigravity, Lovable) should:

1. Read `phase-status.md` before starting work
2. Update `phase-status.md` when finishing a milestone
3. Use the tool-specific entry file listed in [AGENTS.md](../AGENTS.md) § Multi-tool handoff

Agents: start at the repo root [AGENTS.md](../AGENTS.md).
