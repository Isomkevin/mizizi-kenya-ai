# Mizizi — Claude Code

**Start here:** Read `docs/phase-status.md` before implementing. Update it when you finish a milestone.

Full guide: `AGENTS.md`. PRD: `docs/product-spec.md`. Roadmap: `.lovable/plan.md`.

## Commands

```bash
bun run dev      # local dev server
bun run lint     # ESLint
bun run build    # production build (regenerates routeTree.gen.ts)
```

## Project

Enterprise agricultural risk intelligence (Kenya AI Challenge 2026). Quality bar: Palantir/Stripe/Linear — intentional UI, not generic SaaS.

**Stack:** TanStack Start, React 19, Tailwind v4 (`src/styles.css`), shadcn/ui, Recharts, Bun. Mock data in `src/lib/mock/` — no backend yet.

## Current focus

- Phase 1 done (landing + design system + route scaffold)
- Phase 2 partial — finish dashboard (⌘K search, charts, Kenya map, extract mocks)
- See `docs/phase-status.md` for checklist

## Rules

1. Routes only in `src/routes/` — see `src/routes/README.md`. Never edit `routeTree.gen.ts`.
2. Design tokens in `src/styles.css`; no default purple/indigo shadcn theme.
3. Use `PlaceholderPanel` for routes not yet built.
4. Backend, auth, real ML out of scope until requested.
5. **Lovable:** no force push or rewriting pushed git history (see `AGENTS.md`).

Path-scoped rules: `.claude/rules/`
