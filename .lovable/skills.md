# Agent skills (Lovable)

This repo ships [Agent Skills](https://agentskills.io/specification) under **`.agents/skills/`**. Lovable reads root **`AGENTS.md`** (always) and this file from the connected GitHub repository.

> Lovable workspace skills (Settings → Skills) are separate from repo skills. Repo skills load when you follow the protocol below or when this file is in context.

## How Lovable should use repo skills

1. **Scan** [`.agents/skills/README.md`](../.agents/skills/README.md) for the skill index.
2. **Match** the user request to a skill's YAML `description` in that skill's `SKILL.md`.
3. **Read** the full `.agents/skills/<name>/SKILL.md` before implementing.
4. **Load** files under `references/` or `scripts/` only when the skill links to them (progressive disclosure).

Do not load every skill upfront. One or two relevant skills per task is enough.

## Mizizi — skills to prioritize

| When the task involves… | Read this skill |
| --- | --- |
| Continuing phased UI work, next milestone | [`continue-build`](../.agents/skills/continue-build/SKILL.md) |
| New TanStack Start app route | [`add-app-route`](../.agents/skills/add-app-route/SKILL.md) |
| Farmer graph, Cypher, Neo4j Aura, GDS (Louvain, PageRank) | [`neo4j-modeling-skill`](../.agents/skills/neo4j-modeling-skill/SKILL.md), [`neo4j-cypher-skill`](../.agents/skills/neo4j-cypher-skill/SKILL.md), [`neo4j-gds-skill`](../.agents/skills/neo4j-gds-skill/SKILL.md) |
| Neo4j setup / first Aura instance | [`neo4j-getting-started-skill`](../.agents/skills/neo4j-getting-started-skill/SKILL.md), [`neo4j-aura-provisioning-skill`](../.agents/skills/neo4j-aura-provisioning-skill/SKILL.md) |
| Graph UI (NVL) | [`neo4j-nvl-skill`](../.agents/skills/neo4j-nvl-skill/SKILL.md) |
| Masumi payments, MIP-003, Cardano escrow | [`masumi`](../.agents/skills/masumi/SKILL.md) |

Full Neo4j bundle (24 skills): installed from [neo4j-contrib/neo4j-skills](https://github.com/neo4j-contrib/neo4j-skills). See the index for all names.

## Optional: Lovable slash commands (workspace)

To get `/skill-name` in the Lovable chat menu (not required for repo-based use):

1. Push this repo to GitHub.
2. **Settings → Skills → Add → Import from GitHub**
3. Paste a subdirectory URL, e.g.  
   `https://github.com/<owner>/mizizi-kenya-ai/tree/main/.agents/skills/continue-build`

Repeat per skill, or upload a `.zip` of a skill folder. Workspace skills apply across all projects in the workspace.

## Updates

Neo4j skills are locked in [`skills-lock.json`](../skills-lock.json). Refresh with:

```bash
npx skills update
```
