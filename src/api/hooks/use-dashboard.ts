import { useQuery } from "@tanstack/react-query";

import { getDashboardFn } from "@/server/functions/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardFn(),
  });
}
