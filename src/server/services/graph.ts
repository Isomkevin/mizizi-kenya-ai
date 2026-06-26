import type { GraphPayload } from "@/api/types";
import { getSubgraph } from "@/server/services/neo4j";
import { getPersistence } from "@/server/services/persistence";

export async function getGraph(farmerId: string): Promise<GraphPayload> {
  const graph = await getPersistence().getGraphByFarmerId(farmerId);
  return graph ?? { nodes: [], edges: [] };
}

export async function expandGraph(rootId: string, depth: number): Promise<GraphPayload> {
  return getSubgraph(rootId, depth);
}
