# Mizizi

**Enterprise agricultural risk intelligence for Kenya**

Mizizi is a platform for the [Kenya AI Challenge 2026 — AgriFin Finance Challenge](https://kenyaai.go.ke). It helps lenders, cooperatives, and field officers see, verify, and explain agricultural credit risk using signals that already exist in the field — cooperative history, mobile money, input purchases, climate, and community relationships — instead of treating farmers as opaque profiles in a spreadsheet.

## Built by **LESOM Dynamics**

## The problem

Agricultural finance rarely fails for lack of capital. It fails because risk is hard to **see**, **verify**, and **explain**. Loan officers work with fragmented data. Farmers rarely understand why a decision was made. Mizizi connects those signals into one auditable view and keeps humans in the loop: AI explains; officers decide.

---

## What Mizizi does

Four intelligence layers work together:

| Layer                    | Purpose                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Graph intelligence**   | Entity relationships — farmers, cooperatives, loans, dealers, climate zones — for trust paths and risk propagation |
| **Explainable AI**       | Grounded recommendations with factor breakdowns, graph evidence, and officer override with audit trail             |
| **Climate intelligence** | County- and parcel-level weather signals tied to lending impact                                                    |
| **Financial analytics**  | Portfolio KPIs, repayment behaviour, geographic exposure, and decision quality metrics                             |

Design principles throughout: **trust**, **transparency**, **explainability**, and **financial confidence**. Every surfaced fact should be traceable to a data source.

---

## Platform surfaces

The app lives at `/app` behind an enterprise shell (sidebar, command bar, role-aware navigation). Planned and in-progress routes:

| Route                            | Purpose                                                                   |
| -------------------------------- | ------------------------------------------------------------------------- |
| `/app`                           | Executive dashboard — KPIs, risk distribution, Kenya map, activity feed   |
| `/app/farmers`                   | Farmer search, filters, and profile command center                        |
| `/app/graph`                     | Force-directed graph workspace — explore entities and paths               |
| `/app/decisions`                 | Pending queue and officer decision workspace                              |
| `/app/analytics`                 | BI views — executive, lending, geographic, climate, graph, explainability |
| `/app/portfolio`, `/app/climate` | Portfolio and climate slices (may merge into analytics)                   |

Public marketing site at `/`.

---

## Architecture

```text
React client (routes + components)
        ↓ TanStack Query hooks
TanStack Start BFF (createServerFn)
        ↓ services
┌───────────────────┬─────────────────┬──────────────────┐
│ Supabase          │ Neo4j Aura      │ Climate APIs     │
│ Auth, Postgres,   │ Graph queries,  │ Open-Meteo, etc. │
│ Storage, RLS      │ GDS, sync       │ (cached)         │
└───────────────────┴─────────────────┴──────────────────┘
```

**Today:** Phases 1–2 ship a full UI shell and dashboard with typed mock data in `src/lib/mock/` — a temporary bridge while the BFF and data layer land.

**Target:** Server functions in `src/server/functions/`, business logic in `src/server/services/`, Postgres schema in `src/server/db/`, Cypher and graph jobs in `src/server/graph/`. Mocks are retired surface-by-surface as live APIs replace them (see [docs/phase-status.md](docs/phase-status.md)).

---

## Tech stack

| Layer           | Choice                                                                            |
| --------------- | --------------------------------------------------------------------------------- |
| Framework       | [TanStack Start](https://tanstack.com/start) — file-based routes in `src/routes/` |
| UI              | React 19, [shadcn/ui](https://ui.shadcn.com), Tailwind CSS v4 (`src/styles.css`)  |
| Data fetching   | TanStack Query + `createServerFn`                                                 |
| Charts          | Recharts                                                                          |
| Graph canvas    | `react-force-graph-2d`                                                            |
| Auth & DB       | Supabase (Auth, Postgres, Storage, RLS)                                           |
| Graph DB        | Neo4j Aura (`neo4j-driver`)                                                       |
| Package manager | [Bun](https://bun.sh)                                                             |

---

## Repository layout

```text
src/
├── routes/           # TanStack Start pages (never edit routeTree.gen.ts)
├── components/
│   ├── app/          # Feature UI — dashboard, farmers, graph, decisions, …
│   ├── landing/      # Public marketing sections
│   └── ui/           # shadcn primitives (reskinned via design tokens)
├── api/              # Client hooks and shared types (as BFF grows)
├── server/           # Server functions, services, DB, graph layer
└── lib/mock/         # Typed mock data (phased out per surface)
docs/
├── product-spec.md   # Full PRD
├── phase-status.md   # Shipped vs. next — start here for contributors
└── …
.agents/skills/       # Agent skills (Neo4j, phased build, Masumi, …)
```

---

## Quick start

```bash
git clone https://github.com/isomkevin/mizizi-kenya-ai.git
cd mizizi-kenya-ai
bun install
bun run dev
```

Dev server: `http://localhost:5173` (hot reload).

| Script           | Description                                       |
| ---------------- | ------------------------------------------------- |
| `bun run dev`    | Local dev server                                  |
| `bun run build`  | Production build (regenerates `routeTree.gen.ts`) |
| `bun run lint`   | ESLint                                            |
| `bun run format` | Prettier                                          |

Before opening a PR that touches routes or components, run `bun run lint` and `bun run build`.

---

## Build status

| Phase | Scope                                                     | Status   |
| ----- | --------------------------------------------------------- | -------- |
| 1     | Design system, landing page, app route scaffold           | **Done** |
| 2     | Enterprise shell, dashboard, ⌘K search, charts, Kenya map | **Done** |
| 3     | Farmer intelligence — search, profile tabs, documents     | Next     |
| 4     | Graph intelligence workspace                              | Planned  |
| 5     | Explainability + officer decision workspace               | Planned  |
| 6     | Analytics platform (GeoJSON map, rollups, exports)        | Planned  |

Details and checklists: [docs/phase-status.md](docs/phase-status.md). Phased roadmap: [.lovable/plan.md](.lovable/plan.md). Full product vision: [docs/product-spec.md](docs/product-spec.md).

---

## Documentation

| Document                                                     | Use when                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| [docs/product-spec.md](docs/product-spec.md)                 | Product vision, IA, design system, engineering standards |
| [docs/phase-status.md](docs/phase-status.md)                 | Picking up work — what's done and what's next            |
| [AGENTS.md](AGENTS.md)                                       | Agent and contributor conventions                        |
| [src/routes/README.md](src/routes/README.md)                 | Routing conventions                                      |
| [src/components/app/README.md](src/components/app/README.md) | App shell and feature patterns                           |

---

## Contributing

Contributions welcome. Follow [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md).

- Routes only under `src/routes/` — do not edit `routeTree.gen.ts`.
- Design tokens live in `src/styles.css`; avoid default shadcn purple/indigo.
- Use `PlaceholderPanel` only until a phase ships real UI for that route.
- This repo syncs with [Lovable](https://lovable.dev): no force push or rewriting pushed git history.

Open an issue or PR with a clear description and test plan.

---

## License

MIT © 2026 Mizizi / LESOM Dynamics
