import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDecisionZkCredentialFn,
  getZkCredentialStatusFn,
  issueZkCredentialFn,
  simulateDrawdownFn,
} from "@/api/functions/zk-credit";

export function useZkCredentialStatus(farmerId: string) {
  return useQuery({
    queryKey: ["zk-credential", farmerId],
    queryFn: () => getZkCredentialStatusFn({ data: { farmerId } }),
    enabled: Boolean(farmerId),
  });
}

export function useDecisionZkCredential(farmerId: string) {
  return useQuery({
    queryKey: ["zk-credential", "decision", farmerId],
    queryFn: () => getDecisionZkCredentialFn({ data: { farmerId } }),
    enabled: Boolean(farmerId),
  });
}

export function useIssueZkCredential(farmerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => issueZkCredentialFn({ data: { farmerId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["zk-credential", farmerId] });
      void queryClient.invalidateQueries({ queryKey: ["zk-credential", "decision", farmerId] });
      void queryClient.invalidateQueries({ queryKey: ["farmers", farmerId] });
    },
  });
}

export function useSimulateDrawdown(farmerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount?: number) => simulateDrawdownFn({ data: { farmerId, amount } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["zk-credential", farmerId] });
      void queryClient.invalidateQueries({ queryKey: ["farmers", farmerId] });
    },
  });
}
