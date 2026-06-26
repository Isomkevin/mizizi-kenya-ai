import { useQuery } from "@tanstack/react-query";

import { graphPayload } from "@/api/hooks/fallback-data";
import { expandGraphFn, getGraphFn } from "@/api/functions/graph";

export function useGraph(farmerId?: string) {
  const resolvedFarmerId = farmerId ?? "farmer-001";
  return useQuery({
    queryKey: ["graph", "base", farmerId],
    queryFn: async () => {
      try {
        return await getGraphFn({ data: { farmerId: resolvedFarmerId } });
      } catch {
        return graphPayload;
      }
    },
  });
}

export function useExpandedGraph(rootId?: string, depth = 1) {
  return useQuery({
    queryKey: ["graph", "expanded", rootId, depth],
    queryFn: async () => {
      try {
        return await expandGraphFn({ data: { rootId: rootId ?? "", depth } });
      } catch {
        return graphPayload;
      }
    },
    enabled: Boolean(rootId),
  });
}
