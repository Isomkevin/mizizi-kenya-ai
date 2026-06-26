---
name: continue-build
description: Pick up Mizizi development from the last agent session. Read phase status and implement the next unchecked milestone.
---

# Continue build

Use when starting a new session or switching from another AI tool.

## Steps

1. Read `docs/phase-status.md`.
2. Implement the next unchecked milestone from that file.
3. Run `bun run lint` and `bun run build` if routes/components changed.
4. Update `docs/phase-status.md` when done.

See also: `.agents/skills/continue-build/SKILL.md` (Antigravity), `AGENTS.md` (all tools).
