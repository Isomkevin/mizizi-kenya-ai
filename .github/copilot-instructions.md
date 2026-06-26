# Mizizi — GitHub Copilot

**Start here:** Read `docs/phase-status.md` before implementing. Update it when you finish a milestone.

Full guide: `AGENTS.md`. PRD: `docs/product-spec.md`. Roadmap: `.lovable/plan.md`.

## Commands

- `bun run dev` — local dev server
- `bun run lint` — ESLint
- `bun run build` — production build

## Project

Enterprise agricultural risk intelligence (Kenya AI Challenge 2026). Intentional, infrastructure-grade UI — not generic admin dashboards.

**Stack:** TanStack Start (file routes in `src/routes/`), React 19, Tailwind v4, shadcn/ui, Recharts, Bun. Typed mock data in `src/lib/mock/`.

## Current focus

Phase 1 complete. Phase 2 in progress (dashboard shell exists; needs ⌘K search, charts, Kenya map). Details in `docs/phase-status.md`.

## Conventions

- TanStack Start routing only — no `src/pages/`. See `src/routes/README.md`.
- Extend `src/styles.css` for design tokens; reskin shadcn primitives.
- `PlaceholderPanel` for unbuilt app routes.
- No backend/auth/ML until explicitly requested.
- Lovable-connected repo: avoid force push and rewriting published history.

Path-specific rules: `.github/instructions/`
