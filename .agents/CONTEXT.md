# Mizizi — Project context (Antigravity)

Persistent memory for agents working in this repository.

## Handoff protocol

1. **Read** `docs/phase-status.md` — current phase, done items, next tasks.
2. **Implement** per `docs/product-spec.md` and `.lovable/plan.md`.
3. **Update** `docs/phase-status.md` when you complete a milestone so the next agent (any tool) can continue seamlessly.

Cross-tool index: `AGENTS.md`.

## Project

Mizizi — enterprise agricultural risk intelligence (Kenya AI Challenge 2026). Graph + explainable AI + climate + financial analytics. UI quality: Palantir/Stripe/Linear tier.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start (`src/routes/`) |
| UI | React 19, shadcn/ui |
| Styling | Tailwind v4 — `src/styles.css` |
| Data | Typed mocks in `src/lib/mock/` (no backend yet) |
| Runtime | Bun |

## Commands

```bash
bun run dev
bun run lint
bun run build
```

## Constraints

- Routes: `src/routes/` only. See `src/routes/README.md`.
- No force push / history rewrite (Lovable-connected). See `AGENTS.md`.
- Backend, auth, real ML out of scope until requested.
- Mock data OK for phased builds; PRD production rules apply later.

## Phase snapshot

See `docs/phase-status.md`. Next: complete Phase 2 dashboard.
