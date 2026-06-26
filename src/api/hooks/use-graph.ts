import { useQuery } from "@tanstack/react-query";

import { expandGraphFn, getGraphFn } from "@/api/functions/graph";

export function useGraph(farmerId?: string) {
  const resolvedFarmerId = farmerId ?? "farmer-001";
  return useQuery({
    queryKey: ["graph", "base", farmerId],
    queryFn: () => getGraphFn({ data: { farmerId: resolvedFarmerId } }),
  });
}

export function useExpandedGraph(rootId?: string, depth = 1) {
  return useQuery({
    queryKey: ["graph", "expanded", rootId, depth],
    queryFn: () => expandGraphFn({ data: { rootId: rootId ?? "", depth } }),
    enabled: Boolean(rootId),
  });
}
