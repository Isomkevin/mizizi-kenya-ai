import { createServerFn } from "@tanstack/react-start";

import { globalSearch, searchFarmerResults } from "@/server/services/search";

export const globalSearchFn = createServerFn({ method: "GET" })
  .validator((data: { query: string; type?: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    return globalSearch({
      query: data.query,
      type: data.type as Parameters<typeof globalSearch>[0]["type"],
      limit: data.limit,
    });
  });

export const searchFarmersFn = createServerFn({ method: "GET" })
  .validator((data: { query: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    return searchFarmerResults(data.query, data.limit);
  });
