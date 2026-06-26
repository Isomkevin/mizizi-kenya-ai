---
name: continue-build
description: Pick up Mizizi development from the last agent session. Read phase status and implement the next unchecked milestone.
---

# Continue build

Use when starting a new session or switching from another AI tool (Cursor, Copilot, Claude Code, Lovable).

## Steps

1. Read `docs/phase-status.md` — identify the current phase and next unchecked task.
2. Read the relevant section in `docs/product-spec.md` for that feature.
3. Scan existing code in the target area before editing.
4. Implement the next milestone only — do not skip ahead to later phases.
5. Run `bun run lint` and `bun run build` if you changed routes or components.
6. Update `docs/phase-status.md` — check off completed items and note any blockers.

## Do not

- Edit `routeTree.gen.ts` by hand
- Add backend/auth without explicit request
- Force push or rewrite git history (Lovable project)
