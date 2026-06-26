---
name: add-app-route
description: Add a new Mizizi app route with sidebar nav entry. Use when creating a new /app/* page or workspace.
---

# Add an app route

## Steps

1. Create `src/routes/app.<name>.tsx` with `createFileRoute("/app/<name>")`.
2. Add `{ to: "/app/<name>", label: "...", icon: ... }` to the `nav` array in `src/routes/app.tsx`.
3. If not ready for full UI, use `PlaceholderPanel` from `@/components/app/PlaceholderPanel`.
4. Add route `head()` meta title consistent with other app routes.
5. Run `bun run build` to regenerate `routeTree.gen.ts`.
6. Update [docs/phase-status.md](../../docs/phase-status.md) if shipping real UI.

## Do not

- Create files under `src/pages/`
- Hand-edit `routeTree.gen.ts`
- Skip the sidebar `nav` entry (orphan routes break IA)

## Reference

- Routing rules: [src/routes/README.md](../../src/routes/README.md)
- Product IA: [docs/product-spec.md](../../docs/product-spec.md) § Information Architecture
