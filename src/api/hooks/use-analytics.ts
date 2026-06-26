import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAnalyticsFn, refreshClimateFn } from "@/api/functions/analytics";
import type { RefreshClimateInput } from "@/server/services/analytics";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => getAnalyticsFn(),
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
