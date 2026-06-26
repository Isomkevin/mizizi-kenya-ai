import { createServerFn } from "@tanstack/react-start";

import { getFarmer, searchFarmers } from "@/server/services/farmers";

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
