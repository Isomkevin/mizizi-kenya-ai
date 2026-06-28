import type { GraphPayload } from "@/api/types";
import { normalizeFarmerId } from "@/lib/id-aliases";
import { fetchFarmerSubgraphFromNeo4j } from "@/server/services/neo4j-evidence";
import { getSubgraph } from "@/server/services/neo4j";
import { getPersistence } from "@/server/services/persistence";

export async function getGraph(farmerId: string, depth = 2): Promise<GraphPayload> {
  const persistence = getPersistence();
  const normalizedId = normalizeFarmerId(farmerId);

  const fromNeo4j = await fetchFarmerSubgraphFromNeo4j(normalizedId, depth);
  if (fromNeo4j?.nodes.length) {
    await persistence.saveGraphByFarmerId(normalizedId, fromNeo4j);
    return fromNeo4j;
  }

  const direct = await persistence.getGraphByFarmerId(normalizedId);
  if (direct && direct.nodes.length > 0) {
    return { ...direct, meta: { source: "local", depth } };
  }

  const fallback = await persistence.getGraphByFarmerId("f-001");
  if (fallback && fallback.nodes.length > 0) {
    return { ...fallback, meta: { source: "local", depth } };
  }

  return { nodes: [], edges: [], meta: { source: "local", depth } };
}

export async function expandGraph(rootId: string, depth: number): Promise<GraphPayload> {
  return getSubgraph(rootId, depth);
}
