import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMasumiStatusFn,
  grantConsentFn,
  listMasumiJobsFn,
  revokeConsentFn,
  runOrchestratorFn,
} from "@/api/functions/agents";
import type { MasumiJobStatus } from "@/api/types";

export function useMasumiStatus() {
  return useQuery({
    queryKey: ["masumi", "status"],
    queryFn: () => getMasumiStatusFn(),
    refetchInterval: 30_000,
  });
}

export function useMasumiJobs(filters?: {
  farmerId?: string;
  status?: MasumiJobStatus;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["masumi", "jobs", filters],
    queryFn: () => listMasumiJobsFn({ data: filters ?? {} }),
    refetchInterval: 10_000,
  });
}

export function useGrantConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { farmerId: string; scope?: string[] }) =>
      grantConsentFn({ data: input }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["farmers", variables.farmerId] });
    },
  });
}

export function useRevokeConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { farmerId: string }) => revokeConsentFn({ data: input }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["farmers", variables.farmerId] });
    },
  });
}

export function useRunOrchestrator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input?: { limit?: number }) => runOrchestratorFn({ data: input ?? {} }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["masumi"] });
    },
  });
}
