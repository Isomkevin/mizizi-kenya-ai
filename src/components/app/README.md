# App components

Feature-level UI for the `/app` workspace (not marketing/landing).

## Layout

- **Shell:** `src/routes/app.tsx` — wires `AppSidebar`, `AppHeader`, `GlobalSearch` (⌘K), `<Outlet />`.
- **Dashboard:** `src/routes/app.index.tsx` — composes `src/components/app/dashboard/*`.
- **Mock data:** `src/lib/mock/dashboard.ts`, `search.ts`.

## Patterns

- **In progress:** `PlaceholderPanel` — dashed border card for routes not yet built.
- **New features:** Add components here (e.g. `FarmerProfile.tsx`, `GraphCanvas.tsx`), keep routes thin.
- **UI primitives:** Import from `@/components/ui/*` (shadcn). Do not duplicate button/card/dialog markup.

## Navigation

Sidebar links are defined in `app.tsx` `nav` array. Add new routes in both `src/routes/app.*.tsx` and that array.
