import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDecisionFn, listDecisionsFn, submitDecisionFn } from "@/server/functions/decisions";
import type { SubmitDecisionInput } from "@/server/services/decisions";

export function useDecisions(
  status?: "pending" | "approved" | "declined" | "override",
  limit = 50,
) {
  return useQuery({
    queryKey: ["decisions", "list", status ?? "all", limit],
    queryFn: () => listDecisionsFn({ data: { status, limit } }),
  });
}

export function useDecision(id?: string) {
  return useQuery({
    queryKey: ["decisions", "detail", id],
    queryFn: () => getDecisionFn({ data: { id: id ?? "" } }),
    enabled: Boolean(id),
  });
}

export function useSubmitDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitDecisionInput) => submitDecisionFn({ data: input }),
    onSuccess: (decision) => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      queryClient.setQueryData(["decisions", "detail", decision.id], decision);
    },
  });
}
