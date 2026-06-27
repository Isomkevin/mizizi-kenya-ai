import type { GraphEdge, GraphNode, GraphPayload } from "@/api/types";

type Neo4jNodeRecord = {
  properties: Record<string, unknown>;
  labels: string[];
  elementId: string;
};

type Neo4jRelRecord = {
  elementId: string;
  startNodeElementId: string;
  endNodeElementId: string;
  type: string;
  properties?: Record<string, unknown>;
};

function serializeProperty(value: unknown): string | number {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "object" && value !== null && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return String(value);
}

export function mapNeo4jGraph(
  nodes: Neo4jNodeRecord[],
  rels: Neo4jRelRecord[],
  meta?: GraphPayload["meta"],
): GraphPayload {
  const elementToBusinessId = new Map<string, string>();

  const mappedNodes: GraphNode[] = nodes.map((node) => {
    const id = String(node.properties.id ?? node.elementId);
    elementToBusinessId.set(node.elementId, id);
    const label = String(node.properties.name ?? node.properties.id ?? id);
    const type = String(node.labels[0] ?? "Entity");
    const properties = Object.fromEntries(
      Object.entries(node.properties)
        .filter(([key]) => key !== "id" && key !== "name")
        .map(([key, value]) => [key, serializeProperty(value)]),
    );

    return {
      id,
      label,
      type,
      properties,
      provenance: node.properties.source ? String(node.properties.source) : "neo4j",
    };
  });

  const mappedEdges: GraphEdge[] = rels.map((rel) => ({
    id: rel.elementId,
    source: elementToBusinessId.get(rel.startNodeElementId) ?? rel.startNodeElementId,
    target: elementToBusinessId.get(rel.endNodeElementId) ?? rel.endNodeElementId,
    type: rel.type,
    properties: rel.properties
      ? Object.fromEntries(
          Object.entries(rel.properties).map(([key, value]) => [
            key,
            serializeProperty(value),
          ]),
        )
      : undefined,
  }));

  return { nodes: mappedNodes, edges: mappedEdges, meta };
}
