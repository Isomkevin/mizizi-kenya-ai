import { createServerFn } from "@tanstack/react-start";

import { getAnalytics, refreshClimate } from "@/server/services/analytics";

export const getAnalyticsFn = createServerFn({ method: "GET" }).handler(async () => {
  return getAnalytics();
});

export const refreshClimateFn = createServerFn({ method: "POST" })
  .validator((data: { county: string; lat: number; lon: number }) => data)
  .handler(async ({ data }) => {
    return refreshClimate(data);
  });
