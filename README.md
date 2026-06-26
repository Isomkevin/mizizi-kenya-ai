# Mizizi – African Agricultural Risk Intelligence

## Overview

Mizizi is a web application that delivers advanced risk intelligence for Kenyan agriculture.  The core idea is to combine the latest data science tools, clean UI layers, and a powerful design system to enable domain experts to make data‑driven decisions early in the growing season.

Key characteristics

- **Target domain** – Kenya, 2026 AI Challenge
- **Technology stack** – TanStack Start + React 19, Tailwind 4, shadcn/ui, Recharts, Bun (frontend tooling)
- **Architecture** – Pure client‑side for now (mock data only).  No backend, auth, or real ML is wired until a future phase.
- **UX philosophy** – intentionally *lovable*; the goal is a domain‑specific UI that feels natural to agronomists, not a generic SaaS template.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/isomkevin/mizizi-kenya-ai.git
cd mizizi-kenya-ai

# Install dependencies (Bun is required)
bun install

# Run the dev server
bun run dev
```

The development server is hot‑reloaded and runs on `http://localhost:5173` by default.

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Launch a local dev server with hot reloading |
| `bun run build` | Build the production bundle and regenerate `routeTree.gen.ts` |
| `bun run lint` | Run ESLint on the source code |

## Project Status

See `docs/phase-status.md` for the current roadmap.  In short:

1. **Phase 1** – Landing page + design system + route scaffold (complete)
2. **Phase 2** – Dashboard in progress: search (⌘K), charts, Kenya map, and mock data extraction

## Contributing

We welcome contributions that follow the rules in `AGENTS.md` and `CLAUDE.md`.

- **Routes** live under `src/routes/`.  Do *not* touch `routeTree.gen.ts`.
- **Design tokens** live in `src/styles.css`.  Stick to the token names instead of the default shadcn theme colours (no purple / indigo).
- For new pages use `PlaceholderPanel` until the real component is built.
- Pushes should be fast‑forward only – no force pushes or rewrites of pushed history.

Please open issues or PRs and follow the style guidelines.

## Roadmap

The full product view is in `docs/product-spec.md`.  The early‑stage roadmap lives in `.lovable/plan.md`.

## License

MIT © 2026 Mizizi
