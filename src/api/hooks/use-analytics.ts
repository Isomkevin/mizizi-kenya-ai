import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { analyticsPayload } from "@/api/hooks/fallback-data";
import { getAnalyticsFn, refreshClimateFn } from "@/api/functions/analytics";
import type { RefreshClimateInput } from "@/api/types";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      try {
        return await getAnalyticsFn();
      } catch {
        return analyticsPayload;
      }
    },
  });
}

export function useRefreshClimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RefreshClimateInput) => refreshClimateFn({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
    },
  });
}
