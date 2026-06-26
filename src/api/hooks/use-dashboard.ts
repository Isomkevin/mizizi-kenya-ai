import { useQuery } from "@tanstack/react-query";

import { dashboardPayload } from "@/api/hooks/fallback-data";
import { getDashboardFn } from "@/api/functions/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      try {
        return await getDashboardFn();
      } catch {
        return dashboardPayload;
      }
    },
  });
}
