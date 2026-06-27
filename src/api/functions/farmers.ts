import { createServerFn } from "@tanstack/react-start";

import type { CreateFarmerInput } from "@/api/types";
import { createFarmer, getFarmer, searchFarmers } from "@/server/services/farmers";

export const getFarmerFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return getFarmer(data.id);
  });

export const searchFarmerProfilesFn = createServerFn({ method: "GET" })
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

export const createFarmerFn = createServerFn({ method: "POST" })
  .validator((data: CreateFarmerInput) => data)
  .handler(async ({ data }) => {
    return createFarmer(data);
  });
