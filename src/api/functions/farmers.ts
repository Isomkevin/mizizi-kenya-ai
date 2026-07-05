import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/api/middleware/require-auth";

import type { CreateFarmerInput, RequestEnrichmentInput } from "@/api/types";
import { createFarmer, getFarmer, searchFarmers } from "@/server/services/farmers";
import { requestFarmerEnrichment } from "@/server/services/farmer-gaps";

export const getFarmerFn = createServerFn({ method: "GET" }).middleware([requireAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return getFarmer(data.id);
  });

export const searchFarmerProfilesFn = createServerFn({ method: "GET" }).middleware([requireAuth])
  .validator(
    (data: {
      query?: string;
      county?: string;
      risk?: "very-low" | "low" | "medium" | "high" | "critical";
      limit?: number;
    }) => data,
  )
  .handler(async ({ data }) => {
    return searchFarmers(data);
  });

export const createFarmerFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: CreateFarmerInput) => data)
  .handler(async ({ data }) => {
    return createFarmer(data);
  });

export const requestEnrichmentFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: RequestEnrichmentInput) => data)
  .handler(async ({ data }) => {
    return requestFarmerEnrichment(data);
  });
