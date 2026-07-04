import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getFarmerAgentEventsFn,
  getPipelineEventsFn,
  getRecentAgentEventsFn,
  listRecentPipelinesFn,
  runCreditPipelineFn,
} from "@/api/functions/credit-pipeline";


export function useRunCreditPipeline() {
  return useMutation({
    mutationFn: (data: { farmerId: string; amount?: number; autoDrawdown?: boolean }) =>
      runCreditPipelineFn({ data }),
  });
}

export function usePipelineEvents(pipelineId?: string) {
  return useQuery({
    queryKey: ["pipeline-events", pipelineId],
    queryFn: () => getPipelineEventsFn({ data: { pipelineId: pipelineId! } }),
    enabled: Boolean(pipelineId),
    refetchInterval: 2000,
  });
}

export function useRecentAgentEvents(limit = 25) {
  return useQuery({
    queryKey: ["recent-agent-events", limit],
    queryFn: () => getRecentAgentEventsFn({ data: { limit } }),
    refetchInterval: 5000,
  });
}

export function useFarmerAgentEvents(farmerId: string, limit = 25) {
  return useQuery({
    queryKey: ["farmer-agent-events", farmerId, limit],
    queryFn: () => getFarmerAgentEventsFn({ data: { farmerId, limit } }),
    enabled: Boolean(farmerId),
  });
}

import { listRecentPipelinesFn } from "@/api/functions/credit-pipeline";

export function useRecentPipelines(limit = 10) {
  return useQuery({
    queryKey: ["recent-pipelines", limit],
    queryFn: () => listRecentPipelinesFn({ data: { limit } }),
    refetchInterval: 5000,
  });
}
