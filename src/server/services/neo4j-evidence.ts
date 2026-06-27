import type { DecisionFactor, FarmerProfile, GraphEvidenceStep, GraphPayload } from "@/api/types";
import { mapNeo4jGraph } from "@/server/services/neo4j-mapper";
import { getNeo4jDriver } from "@/server/services/neo4j";
import { getPersistence } from "@/server/services/persistence";

export interface FarmerGraphMetrics {
  degree: number;
  documentCount: number;
  cooperativePagerank: number | null;
  gdsAvailable: boolean;
  source: "neo4j" | "local";
}

const EVIDENCE_QUERY_BY_SOURCE: Record<string, string> = {
  climate_observations: `
    MATCH (f:Farmer {id: $farmerId})-[r:LOCATED_IN]->(z:ClimateZone)
    RETURN f.id AS fromId, f.name AS fromLabel, 'Farmer' AS fromType,
           type(r) AS rel, z.id AS toId, z.name AS toLabel, labels(z)[0] AS toType
    LIMIT 1
  `,
  repayment_history: `
    MATCH (f:Farmer {id: $farmerId})-[r:OWNS_LOAN]->(l:Loan)
    RETURN f.id AS fromId, f.name AS fromLabel, 'Farmer' AS fromType,
           type(r) AS rel, l.id AS toId, coalesce(l.name, l.id) AS toLabel, labels(l)[0] AS toType
    LIMIT 1
  `,
  graph_topology: `
    MATCH (f:Farmer {id: $farmerId})-[r:MEMBER_OF]->(c:Cooperative)
    RETURN f.id AS fromId, f.name AS fromLabel, 'Farmer' AS fromType,
           type(r) AS rel, c.id AS toId, c.name AS toLabel, labels(c)[0] AS toType
    LIMIT 1
  `,
  profile_quality: `
    MATCH (f:Farmer {id: $farmerId})-[r:HAS_DOCUMENT]->(d:Document)
    RETURN f.id AS fromId, f.name AS fromLabel, 'Farmer' AS fromType,
           type(r) AS rel, d.id AS toId, d.name AS toLabel, labels(d)[0] AS toType
    ORDER BY d.uploadedAt DESC
    LIMIT 1
  `,
};

function clampDepth(depth: number): number {
  return Math.min(3, Math.max(1, Math.round(depth)));
}

export async function fetchFarmerSubgraphFromNeo4j(
  farmerId: string,
  depth = 2,
): Promise<GraphPayload | null> {
  const driver = getNeo4jDriver();
  if (!driver) return null;

  const safeDepth = clampDepth(depth);
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (root {id: $rootId})
      CALL {
        WITH root
        MATCH path = (root)-[*1..${safeDepth}]-(neighbor)
        RETURN path
      }
      WITH collect(path) AS paths
      UNWIND paths AS p
      UNWIND nodes(p) AS n
      WITH collect(DISTINCT n) AS nodeList, paths
      UNWIND paths AS p2
      UNWIND relationships(p2) AS r
      RETURN nodeList AS nodes, collect(DISTINCT r) AS rels
      `,
      { rootId: farmerId },
    );

    const record = result.records[0];
    if (!record) return null;

    const nodes = record.get("nodes") as Array<{
      properties: Record<string, unknown>;
      labels: string[];
      elementId: string;
    }>;
    const rels = record.get("rels") as Array<{
      elementId: string;
      startNodeElementId: string;
      endNodeElementId: string;
      type: string;
      properties?: Record<string, unknown>;
    }>;

    if (!nodes?.length) return null;

    return mapNeo4jGraph(nodes, rels ?? [], {
      source: "neo4j",
      depth: safeDepth,
      syncedAt: new Date().toISOString(),
    });
  } catch {
    return null;
  } finally {
    await session.close();
  }
}

function buildLocalEvidenceSteps(graphPath: string[], graph: GraphPayload): GraphEvidenceStep[] {
  return graphPath.map((nodeId, index) => {
    const node = graph.nodes.find((entry) => entry.id === nodeId);
    const incoming = graph.edges.find((edge) => edge.target === nodeId);
    return {
      nodeId,
      label: node?.label ?? nodeId,
      type: node?.type ?? "Entity",
      relationship: index > 0 ? incoming?.type : undefined,
    };
  });
}

async function resolveNeo4jEvidenceStep(
  farmerId: string,
  source: string,
): Promise<GraphEvidenceStep[] | null> {
  const query = EVIDENCE_QUERY_BY_SOURCE[source];
  if (!query) return null;

  const driver = getNeo4jDriver();
  if (!driver) return null;

  const session = driver.session();
  try {
    const result = await session.run(query, { farmerId });
    const record = result.records[0];
    if (!record) return null;

    const fromId = String(record.get("fromId"));
    const toId = String(record.get("toId"));
    const rel = String(record.get("rel"));

    return [
      {
        nodeId: fromId,
        label: String(record.get("fromLabel") ?? fromId),
        type: String(record.get("fromType") ?? "Farmer"),
      },
      {
        nodeId: toId,
        label: String(record.get("toLabel") ?? toId),
        type: String(record.get("toType") ?? "Entity"),
        relationship: rel,
      },
    ];
  } catch {
    return null;
  } finally {
    await session.close();
  }
}

export async function resolveFactorGraphEvidence(
  farmerId: string,
  factor: DecisionFactor,
  localGraph?: GraphPayload,
): Promise<GraphEvidenceStep[]> {
  const fromNeo4j = await resolveNeo4jEvidenceStep(farmerId, factor.source);
  if (fromNeo4j?.length) return fromNeo4j;

  const graph =
    localGraph ??
    (await getPersistence().getGraphByFarmerId(farmerId)) ??
    ({ nodes: [], edges: [] } as GraphPayload);

  if (factor.graphPath?.length) {
    return buildLocalEvidenceSteps(factor.graphPath, graph);
  }

  return [];
}

export async function enrichFactorsWithGraphEvidence(
  farmerId: string,
  factors: DecisionFactor[],
  localGraph?: GraphPayload,
): Promise<DecisionFactor[]> {
  return Promise.all(
    factors.map(async (factor) => {
      const graphEvidence = await resolveFactorGraphEvidence(farmerId, factor, localGraph);
      const graphPath =
        graphEvidence.length > 0 ? graphEvidence.map((step) => step.nodeId) : factor.graphPath;

      return {
        ...factor,
        graphPath,
        graphEvidence: graphEvidence.length ? graphEvidence : factor.graphEvidence,
      };
    }),
  );
}

async function getLocalGraphMetrics(
  farmerId: string,
  farmer: FarmerProfile,
): Promise<FarmerGraphMetrics> {
  const graph = (await getPersistence().getGraphByFarmerId(farmerId)) ?? {
    nodes: [],
    edges: [],
  };
  const degree = graph.edges.filter(
    (edge) => edge.source === farmerId || edge.target === farmerId,
  ).length;
  const documentCount = graph.nodes.filter((node) => node.type === "Document").length;

  return {
    degree: Math.max(degree, farmer.graphConnections),
    documentCount,
    cooperativePagerank: null,
    gdsAvailable: false,
    source: "local",
  };
}

export async function getFarmerGraphMetrics(
  farmerId: string,
  farmer: FarmerProfile,
): Promise<FarmerGraphMetrics> {
  const driver = getNeo4jDriver();
  if (!driver) return getLocalGraphMetrics(farmerId, farmer);

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (f:Farmer {id: $farmerId})
      OPTIONAL MATCH (f)-[rel]-()
      WITH f, count(rel) AS degree
      OPTIONAL MATCH (f)-[:HAS_DOCUMENT]->(d:Document)
      WITH f, degree, count(d) AS documentCount
      OPTIONAL MATCH (f)-[:MEMBER_OF]->(c:Cooperative)
      RETURN degree, documentCount, c.trustScore AS cooperativeTrust
      `,
      { farmerId },
    );

    const record = result.records[0];
    if (!record) return getLocalGraphMetrics(farmerId, farmer);

    let gdsAvailable = false;
    try {
      await session.run(`CALL gds.version() YIELD gdsVersion RETURN gdsVersion`);
      gdsAvailable = true;
    } catch {
      gdsAvailable = false;
    }

    const cooperativeTrust = record.get("cooperativeTrust");
    return {
      degree: Number(record.get("degree") ?? 0),
      documentCount: Number(record.get("documentCount") ?? 0),
      cooperativePagerank:
        cooperativeTrust === null || cooperativeTrust === undefined
          ? null
          : Number(cooperativeTrust),
      gdsAvailable,
      source: "neo4j",
    };
  } catch {
    return getLocalGraphMetrics(farmerId, farmer);
  } finally {
    await session.close();
  }
}

export async function tryRefreshGdsTrustScores(): Promise<{
  updated: number;
  gdsAvailable: boolean;
}> {
  const driver = getNeo4jDriver();
  if (!driver) return { updated: 0, gdsAvailable: false };

  const session = driver.session();
  try {
    await session.run(`CALL gds.version() YIELD gdsVersion RETURN gdsVersion`);
  } catch {
    return { updated: 0, gdsAvailable: false };
  }

  const graphName = "mizizi_cooperative_trust";
  try {
    await session.run(`CALL gds.graph.drop($graphName, false)`, { graphName });
  } catch {
    // Graph projection may not exist yet.
  }

  try {
    await session.run(
      `
      CALL gds.graph.project(
        $graphName,
        ['Farmer', 'Cooperative'],
        { MEMBER_OF: { orientation: 'UNDIRECTED' } }
      )
      `,
      { graphName },
    );

    const result = await session.run(
      `
      CALL gds.pageRank.write($graphName, { writeProperty: 'trustScore' })
      YIELD nodePropertiesWritten
      RETURN nodePropertiesWritten
      `,
      { graphName },
    );

    const written = Number(result.records[0]?.get("nodePropertiesWritten") ?? 0);
    return { updated: written, gdsAvailable: true };
  } catch {
    return { updated: 0, gdsAvailable: true };
  } finally {
    await session.close();
  }
}

export function summarizeGraphEvidenceForPrompt(
  factors: DecisionFactor[],
): Array<{ factor: string; path: string; verified: boolean }> {
  return factors
    .filter((factor) => factor.graphEvidence?.length)
    .map((factor) => ({
      factor: factor.label,
      path: (factor.graphEvidence ?? [])
        .map((step, index) =>
          index === 0
            ? `${step.type}:${step.label}`
            : `-[${step.relationship ?? "LINKED"}]->${step.type}:${step.label}`,
        )
        .join(" "),
      verified: Boolean(factor.graphEvidence?.length),
    }));
}
