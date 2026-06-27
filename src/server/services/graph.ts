import type { GraphPayload } from "@/api/types";
import { getSubgraph } from "@/server/services/neo4j";
import { getPersistence } from "@/server/services/persistence";

const LEGACY_FARMER_ID_ALIASES: Record<string, string> = {
  "farmer-001": "f-001",
};

export async function getGraph(farmerId: string): Promise<GraphPayload> {
  const persistence = getPersistence();
  const normalizedId = LEGACY_FARMER_ID_ALIASES[farmerId] ?? farmerId;

  const direct = await persistence.getGraphByFarmerId(normalizedId);
  if (direct && direct.nodes.length > 0) return direct;

  const fallback = await persistence.getGraphByFarmerId("f-001");
  if (fallback && fallback.nodes.length > 0) return fallback;

  return { nodes: [], edges: [] };
}

export async function expandGraph(rootId: string, depth: number): Promise<GraphPayload> {
  return getSubgraph(rootId, depth);
}
