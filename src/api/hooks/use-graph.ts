import { useQuery } from "@tanstack/react-query";

import { graphPayload } from "@/api/hooks/fallback-data";
import { expandGraphFn, getGraphFn } from "@/api/functions/graph";
import type { GraphPayload } from "@/api/types";

export const DEFAULT_GRAPH_FARMER_ID = "f-001";

function withGraphFallback(payload: GraphPayload): GraphPayload {
  return payload.nodes.length > 0 ? payload : graphPayload;
}

export function useGraph(farmerId?: string, depth = 2) {
  const resolvedFarmerId = farmerId ?? DEFAULT_GRAPH_FARMER_ID;
  return useQuery({
    queryKey: ["graph", "base", resolvedFarmerId, depth],
    queryFn: async () => {
      try {
        const payload = await getGraphFn({ data: { farmerId: resolvedFarmerId, depth } });
        return withGraphFallback(payload);
      } catch {
        return graphPayload;
      }
    },
  });
}

export function useExpandedGraph(rootId?: string, depth = 2) {
  return useQuery({
    queryKey: ["graph", "expanded", rootId, depth],
    queryFn: async () => {
      try {
        const payload = await expandGraphFn({ data: { rootId: rootId ?? "", depth } });
        return withGraphFallback(payload);
      } catch {
        return graphPayload;
      }
    },
    enabled: Boolean(rootId),
  });
}
