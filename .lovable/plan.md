# Mizizi — Build Plan

Phased delivery so each surface meets the Palantir/Stripe/Linear quality bar. **Progress:** [docs/phase-status.md](../docs/phase-status.md). **Full spec:** [docs/product-spec.md](../docs/product-spec.md).

## Phase 1 — Foundation + Landing Page

**Design system** (`src/styles.css`)

- Brand tokens: deep navy/forest "infrastructure" palette, signal accent, risk semantic colors (low/medium/high/critical)
- Typography: serif display for editorial moments, geometric sans for UI, mono for data
- Radius, spacing, shadow, motion timing tokens per spec §Design System

**Landing page** — 10 sections per spec §Landing Page Experience

1. Hero — "Agricultural Finance Doesn't Fail Because Farmers Are Too Risky. It Fails Because Risk Is Invisible."
2. The Invisible Farmer
3. The Cost of Fragmentation
4. The Mizizi Difference
5. Statistics
6. Why Existing Systems Fail
7. Platform Preview (annotated product screenshot mock)
8. Built for the Entire Ecosystem (Banks, SACCOs, Insurers, Gov, NGOs…)
9. Future Vision
10. Final CTA

Editorial typography, restrained motion, no generic SaaS tropes. Real diagrams, not stock icons.

**Routing scaffold** for the app — empty shells with sidebar so navigation is real:

- `/app` dashboard
- `/app/farmers` farmer intelligence
- `/app/graph` graph workspace
- `/app/analytics` analytics
- `/app/portfolio`, `/app/climate`, `/app/decisions` placeholder cards

## Phase 2 — App Shell + Dashboard

Enterprise layout (sidebar, command bar, global search ⌘K), KPI cards, risk distribution, geographic intelligence (Kenya map), AI insights feed, recent activity, quick actions. Uses mock data.

## Phase 3 — Farmer Intelligence

Search, farmer profile with tabs: Overview, Graph, Explainability, Timeline, Documents, Communications.

## Phase 4 — Graph Intelligence Workspace

Interactive force-directed graph canvas (react-force-graph or d3), node/edge legend, sidebar inspector, path viewer.

## Phase 5 — Explainability Workspace

Decision summary, contributing factors waterfall, positive/negative signals, officer decision workspace.

## Phase 6 — Analytics Platform

Executive overview, lending, geographic, climate, graph analytics, explainability analytics (Recharts).

## Out of scope until requested

- Backend / Lovable Cloud (everything uses typed mock data)
- Auth
- Real ML models — explainability uses curated mock payloads

## Technical notes

- TanStack Start file-based routes under `src/routes/` (landing at `/`, app under `/app.*.tsx` layout)
- Tailwind v4 tokens in `src/styles.css`; shadcn primitives reskinned, no default purple/indigo
- Mock data in `src/lib/mock/` typed with Zod-style interfaces so Phase 2+ can swap to server functions cleanly
- Charts: Recharts (already shadcn-wired). Graph: `react-force-graph-2d` (added Phase 4)
- Fonts via `<link>` in `__root.tsx` head (per template rules)

## Agent handoff

All AI agents should read [AGENTS.md](../AGENTS.md) at the repo root before starting work.
