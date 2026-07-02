import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/server/middleware/require-auth";

import { getAnalytics, refreshClimate } from "@/server/services/analytics";

export const getAnalyticsFn = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(async () => {
  return getAnalytics();
});

export const refreshClimateFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: { county: string; lat: number; lon: number }) => data)
  .handler(async ({ data }) => {
    return refreshClimate(data);
  });
