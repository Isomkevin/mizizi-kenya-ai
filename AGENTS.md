# Mizizi — Agent Guide

Entry point for AI coding agents continuing work on this repository.

## Lovable connection

<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Project

**Mizizi** is an enterprise agricultural risk intelligence platform for the Kenya AI Challenge 2026 (AgriFin Finance Challenge). It combines graph intelligence, explainable AI, climate signals, and financial risk analytics.

Quality bar: intentional, editorial, infrastructure-grade UI — not generic SaaS templates. Reference aesthetic: Palantir, Stripe, Linear, Bloomberg.

## Stack

| Layer           | Choice                                                               |
| --------------- | -------------------------------------------------------------------- |
| Framework       | TanStack Start (file-based routes in `src/routes/`)                  |
| UI              | React 19, shadcn/ui primitives in `src/components/ui/`               |
| Styling         | Tailwind CSS v4 tokens in `src/styles.css`                           |
| Charts          | Recharts (via shadcn chart components)                               |
| Graph (Phase 4) | `react-force-graph-2d`                                               |
| Data (current)  | Local-first persisted seed + Supabase/Neo4j adapters (`src/server/`) |
| Package manager | Bun                                                                  |

## Documentation map

| File                                                         | Purpose                                                                            |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [docs/product-spec.md](docs/product-spec.md)                 | Full PRD (~3,800 lines) — product vision, IA, design system, engineering standards |
| [docs/neo4j-implementation.md](docs/neo4j-implementation.md) | External Neo4j architecture, evidence pipeline, deployment (no code paths)         |
| [docs/neo4j.md](docs/neo4j.md)                               | Developer Neo4j setup — local Docker, Aura, troubleshooting                      |
| [.lovable/plan.md](.lovable/plan.md)                         | Phased build roadmap (Lovable + agents)                                            |
| [.lovable/skills.md](.lovable/skills.md)                     | How Lovable uses repo agent skills                                                 |
| [.agents/skills/README.md](.agents/skills/README.md)         | Skill index (Neo4j, Masumi, continue-build, …)                                     |
| [src/routes/README.md](src/routes/README.md)                 | TanStack Start routing conventions                                                 |
| [src/components/app/README.md](src/components/app/README.md) | App shell and feature component patterns                                           |
| [src/lib/mock/README.md](src/lib/mock/README.md)             | Mock data conventions                                                              |

## Current focus

See [docs/phase-status.md](docs/phase-status.md). At a glance:

- **Done:** Phases 0–6 (foundation, dashboard, farmers, graph, decisions, analytics)
- **Current:** Production hardening and deeper integration quality (Supabase auth sessions, Neo4j online/GDS paths, test coverage)

## Conventions

1. **Routes** — Use `src/routes/` only. No `src/pages/`, no Next.js layouts. See `src/routes/README.md`.
2. **Design tokens** — Extend `src/styles.css`; reskin shadcn primitives. No default purple/indigo palette.
3. **Mock data** — Add typed modules under `src/lib/mock/`. Structure for later swap to server functions.
4. **App placeholders** — Use `PlaceholderPanel` only until a phase ships real UI for that route.
5. **Fonts** — Load via `<link>` in `src/routes/__root.tsx` head (template rule).
6. **Scope** — Default runtime is local-first with persisted seed; Supabase/Neo4j are first-class adapters. Keep UI surfaces on hooks/server functions, and use hook-level fallback data only as a resilience path.

## Agent skills

Project skills live in **`.agents/skills/<name>/SKILL.md`** (mirrored under `.cursor/skills/` for Cursor). Each skill has YAML frontmatter with `name` and `description`; the agent loads the full file only when the task matches the description.

**All agents (including Lovable):** read [.agents/skills/README.md](.agents/skills/README.md) when the task may match a skill. Then open the relevant `SKILL.md` before implementing.

| Domain                   | Key skills                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| Phased UI build          | `continue-build`, `add-app-route`                                                              |
| Neo4j / graph (Phase 4+) | `neo4j-modeling-skill`, `neo4j-cypher-skill`, `neo4j-gds-skill`, `neo4j-getting-started-skill` |
| Neo4j local + Aura setup | [docs/neo4j.md](docs/neo4j.md) — `bun run neo4j:local` or `bun run neo4j:setup`                |
| Masumi / payments        | `masumi`                                                                                       |

Neo4j bundle: `npx skills add neo4j-contrib/neo4j-skills` (see `skills-lock.json`). **Lovable:** also read [.lovable/skills.md](.lovable/skills.md).

## Multi-tool handoff

This repo is set up so different AI coding tools can continue the same work. **Always read [docs/phase-status.md](docs/phase-status.md) first** — it is the shared “where we left off” file every agent should update after milestones.

| Tool                   | Entry file(s)                                                |
| ---------------------- | ------------------------------------------------------------ |
| **Any agent**          | `AGENTS.md` (this file)                                      |
| **Cursor**             | `.cursor/rules/`, `.cursor/skills/`                          |
| **Claude Code**        | `CLAUDE.md`, `.claude/rules/`                                |
| **VS Code Copilot**    | `.github/copilot-instructions.md`, `.github/skills/`         |
| **Google Antigravity** | `.agents/CONTEXT.md`, `.agents/agents.md`, `.agents/skills/` |
| **Lovable**            | `.lovable/plan.md`, `.lovable/skills.md`, `.agents/skills/`  |

Canonical docs: [docs/product-spec.md](docs/product-spec.md) (PRD), [docs/phase-status.md](docs/phase-status.md) (progress).

## Before you ship

- Run `bun run lint` and `bun run build` if you changed routes or components.
- Update [docs/phase-status.md](docs/phase-status.md) when completing a phase or major milestone.
- Keep changes focused — match existing patterns in neighboring files.
