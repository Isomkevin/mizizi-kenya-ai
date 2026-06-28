import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { decisionQueue } from "@/api/hooks/fallback-data";
import { getDecisionFn, listDecisionsFn, submitDecisionFn } from "@/api/functions/decisions";
import type { SubmitDecisionInput } from "@/api/types";
import { normalizeDecisionId } from "@/lib/id-aliases";

export function useDecisions(
  status?: "pending" | "approved" | "declined" | "override",
  limit = 50,
) {
  return useQuery({
    queryKey: ["decisions", "list", status ?? "all", limit],
    queryFn: async () => {
      try {
        const rows = await listDecisionsFn({ data: { status, limit } });
        if (rows.length) return rows;
      } catch {
        // fall through to client seed
      }
      return decisionQueue
        .filter((item) => (status ? item.status === status : true))
        .slice(0, limit);
    },
  });
}

export function useDecision(id?: string) {
  return useQuery({
    queryKey: ["decisions", "detail", id],
    queryFn: async () => {
      const lookupId = normalizeDecisionId(id ?? "");
      try {
        const result = await getDecisionFn({ data: { id: lookupId } });
        if (result) return result;
      } catch {
        // fall through to client seed
      }
      return decisionQueue.find((item) => item.id === lookupId) ?? null;
    },
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
