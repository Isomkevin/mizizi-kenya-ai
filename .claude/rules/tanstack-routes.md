---
paths:
  - "src/routes/**"
---

# TanStack Start routes

- One route per file under `src/routes/`. Landing: `index.tsx` → `/`. App layout: `app.tsx` with `<Outlet />`.
- App children use dot notation: `app.farmers.tsx` → `/app/farmers`.
- Dynamic segments use bare `$`. No `src/pages/`. Do not edit `routeTree.gen.ts`.
- See `src/routes/README.md`.
