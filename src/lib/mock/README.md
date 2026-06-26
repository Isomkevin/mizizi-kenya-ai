# Mock data

Typed mock payloads for UI development until Lovable Cloud / backend is enabled.

## Conventions

- One module per domain: `farmers.ts`, `dashboard.ts`, `graph.ts`, etc.
- Export TypeScript interfaces/types alongside data.
- Prefer Zod schemas where validation helps (`zod` is installed).
- Keep shapes aligned with [docs/product-spec.md](../../../docs/product-spec.md) API sections so server functions can swap in later.

## Usage

```tsx
import { dashboardKpis } from "@/lib/mock/dashboard";
```

## Migration

Inline arrays in route files (e.g. `app.index.tsx`) should move here as phases mature. See [docs/phase-status.md](../../../docs/phase-status.md).
