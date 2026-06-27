import neo4j, { type Driver, type Session } from "neo4j-driver";

import type {
  DocumentExtractionResult,
  DocumentRecord,
  FarmerProfile,
  GraphPayload,
} from "@/api/types";
import { getDb } from "@/server/db/local-store";
import { serverEnv } from "@/server/env";
import { fetchFarmerSubgraphFromNeo4j } from "@/server/services/neo4j-evidence";
import { getPersistence } from "@/server/services/persistence";

let driver: Driver | null | undefined;

export function getNeo4jDriver(): Driver | null {
  if (driver !== undefined) return driver;
  const uri = serverEnv.neo4jUri();
  const password = serverEnv.neo4jPassword();
  if (!uri || !password) {
    driver = null;
    return null;
  }
  driver = neo4j.driver(uri, neo4j.auth.basic(serverEnv.neo4jUser(), password));
  return driver;
}

export function openNeo4jSession(activeDriver: Driver): Session {
  return activeDriver.session({ database: serverEnv.neo4jDatabase() });
}

export interface Neo4jStatus {
  connected: boolean;
  message: string;
  profile?: "local" | "aura" | "custom";
  database?: string;
  farmerNodes?: number;
  relationshipCount?: number;
}

function buildFallbackGraph(farmer: FarmerProfile): GraphPayload {
  const cooperativeId = `coop-${farmer.id}`;
  const loanId = `loan-${farmer.id}`;
  const dealerId = `dealer-${farmer.id}`;
  const climateZoneId = `zone-${farmer.county.toLowerCase().replace(/\s+/g, "-")}`;
  return {
    nodes: [
      {
        id: farmer.id,
        label: farmer.name,
        type: "Farmer",
        risk: farmer.risk,
        properties: { county: farmer.county, confidence: farmer.confidence },
      },
      {
        id: cooperativeId,
        label: farmer.cooperative,
        type: "Cooperative",
        properties: { county: farmer.county },
      },
      {
        id: loanId,
        label: `Loan ${farmer.loanAmountKes ?? 0}`,
        type: "Loan",
        properties: { status: farmer.applicationStatus ?? "pending" },
      },
      {
        id: dealerId,
        label: `${farmer.county} Input Dealer`,
        type: "InputDealer",
        properties: { county: farmer.county },
      },
      {
        id: climateZoneId,
        label: `${farmer.county} Climate Zone`,
        type: "ClimateZone",
        properties: { droughtProbability: farmer.climate.droughtProbability },
      },
    ],
    edges: [
      { id: `${farmer.id}-e1`, source: farmer.id, target: cooperativeId, type: "MEMBER_OF" },
      { id: `${farmer.id}-e2`, source: farmer.id, target: loanId, type: "OWNS_LOAN" },
      { id: `${farmer.id}-e3`, source: farmer.id, target: dealerId, type: "PURCHASES_FROM" },
      { id: `${farmer.id}-e4`, source: farmer.id, target: climateZoneId, type: "LOCATED_IN" },
    ],
  };
}

export async function syncFarmerToGraph(
  farmer: FarmerProfile,
): Promise<{ synced: boolean; source: "neo4j" | "local" }> {
  const activeDriver = getNeo4jDriver();
  if (!activeDriver) {
    const persistence = getPersistence();
    const fallbackGraph = buildFallbackGraph(farmer);
    await persistence.saveGraphByFarmerId(farmer.id, fallbackGraph);
    return { synced: true, source: "local" };
  }

  const session = openNeo4jSession(activeDriver);
  try {
    await session.executeWrite((tx) =>
      tx.run(
        `
        MERGE (f:Farmer {id: $id})
        SET f.name = $name, f.county = $county, f.risk = $risk, f.confidence = $confidence
        MERGE (c:Cooperative {id: $coopId})
        SET c.name = $cooperative, c.county = $county
        MERGE (l:Loan {id: $loanId})
        SET l.amountKes = $amountKes
        MERGE (d:InputDealer {id: $dealerId})
        SET d.name = $dealerName, d.county = $county
        MERGE (z:ClimateZone {id: $zoneId})
        SET z.name = $zoneName, z.droughtProbability = $droughtProbability
        MERGE (f)-[:MEMBER_OF]->(c)
        MERGE (f)-[:OWNS_LOAN]->(l)
        MERGE (f)-[:PURCHASES_FROM]->(d)
        MERGE (f)-[:LOCATED_IN]->(z)
        `,
        {
          id: farmer.id,
          name: farmer.name,
          county: farmer.county,
          risk: farmer.risk,
          confidence: farmer.confidence,
          coopId: `coop-${farmer.id}`,
          cooperative: farmer.cooperative,
          loanId: `loan-${farmer.id}`,
          amountKes: farmer.loanAmountKes ?? 0,
          dealerId: `dealer-${farmer.id}`,
          dealerName: `${farmer.county} Input Dealer`,
          zoneId: `zone-${farmer.county.toLowerCase().replace(/\s+/g, "-")}`,
          zoneName: `${farmer.county} Climate Zone`,
          droughtProbability: farmer.climate.droughtProbability,
        },
      ),
    );
    return { synced: true, source: "neo4j" };
  } finally {
    await session.close();
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function appendDocumentToLocalGraph(
  farmerId: string,
  document: DocumentRecord,
  extraction: DocumentExtractionResult,
): Promise<void> {
  const persistence = getPersistence();
  const existing = (await persistence.getGraphByFarmerId(farmerId)) ?? { nodes: [], edges: [] };
  const nodes = [...existing.nodes];
  const edges = [...existing.edges];

  const docNodeId = document.id;
  if (!nodes.some((node) => node.id === docNodeId)) {
    nodes.push({
      id: docNodeId,
      label: document.name,
      type: "Document",
      properties: {
        docType: document.type,
        verificationStatus: document.verificationStatus,
        ocrStatus: document.ocrStatus,
      },
    });
    edges.push({
      id: `${farmerId}-doc-${document.id}`,
      source: farmerId,
      target: docNodeId,
      type: "HAS_DOCUMENT",
    });
  }

  for (const entity of extraction.entities) {
    if (entity.confidence < 0.6) continue;
    const entityId = `${slugify(entity.type)}-${slugify(entity.name)}`;
    if (!nodes.some((node) => node.id === entityId)) {
      nodes.push({
        id: entityId,
        label: entity.name,
        type: entity.type,
        properties: { confidence: entity.confidence },
      });
    }
    const edgeId = `${farmerId}-${entityId}-${document.id}`;
    if (!edges.some((edge) => edge.id === edgeId)) {
      const relType =
        entity.type === "Cooperative"
          ? "MEMBER_OF"
          : entity.type === "FarmParcel"
            ? "HAS_PARCEL"
            : entity.type === "InputDealer"
              ? "PURCHASES_FROM"
              : "LINKED_TO";
      edges.push({ id: edgeId, source: farmerId, target: entityId, type: relType });
    }
  }

  await persistence.saveGraphByFarmerId(farmerId, { nodes, edges });
}

export async function syncDocumentToGraph(
  farmer: FarmerProfile,
  document: DocumentRecord,
  extraction: DocumentExtractionResult,
): Promise<{ synced: boolean; source: "neo4j" | "local" }> {
  const activeDriver = getNeo4jDriver();
  if (!activeDriver) {
    await appendDocumentToLocalGraph(farmer.id, document, extraction);
    await syncFarmerToGraph(farmer);
    return { synced: true, source: "local" };
  }

  const session = openNeo4jSession(activeDriver);
  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MERGE (f:Farmer {id: $farmerId})
        SET f.name = $farmerName, f.county = $county
        MERGE (d:Document {id: $docId})
        SET d.name = $docName, d.type = $docType, d.verificationStatus = $verificationStatus,
            d.ocrStatus = $ocrStatus, d.source = $source, d.uploadedAt = $uploadedAt
        MERGE (f)-[:HAS_DOCUMENT]->(d)
        MERGE (src:DataSource {id: $sourceId})
        SET src.type = 'officer_upload', src.provider = $provider
        MERGE (src)-[:PROVIDED]->(d)
        `,
        {
          farmerId: farmer.id,
          farmerName: farmer.name,
          county: farmer.county,
          docId: document.id,
          docName: document.name,
          docType: document.type,
          verificationStatus: document.verificationStatus,
          ocrStatus: document.ocrStatus,
          source: document.source,
          uploadedAt: document.uploadedAt,
          sourceId: `upload-${document.id}`,
          provider: document.extractionProvider ?? "rules",
        },
      );

      const cooperativeName =
        String(
          extraction.extractedFields.cooperativeName ??
            extraction.extractedFields.cooperative ??
            "",
        ) || farmer.cooperative;
      if (cooperativeName) {
        const coopId = `coop-${slugify(cooperativeName)}`;
        await tx.run(
          `
          MERGE (c:Cooperative {id: $coopId})
          SET c.name = $coopName, c.county = $county
          MERGE (f:Farmer {id: $farmerId})
          MERGE (f)-[:MEMBER_OF]->(c)
          `,
          { coopId, coopName: cooperativeName, county: farmer.county, farmerId: farmer.id },
        );
      }

      const parcelHa = extraction.extractedFields.parcelHa;
      if (typeof parcelHa === "number" && parcelHa > 0) {
        const parcelId = `parcel-${farmer.id}`;
        await tx.run(
          `
          MERGE (p:FarmParcel {id: $parcelId})
          SET p.hectares = $parcelHa
          MERGE (f:Farmer {id: $farmerId})
          MERGE (f)-[:HAS_PARCEL]->(p)
          `,
          { parcelId, parcelHa, farmerId: farmer.id },
        );
      }
    });

    await appendDocumentToLocalGraph(farmer.id, document, extraction);
    return { synced: true, source: "neo4j" };
  } catch {
    await appendDocumentToLocalGraph(farmer.id, document, extraction);
    await syncFarmerToGraph(farmer);
    return { synced: true, source: "local" };
  } finally {
    await session.close();
  }
}

export async function getSubgraph(rootId: string, depth = 1): Promise<GraphPayload> {
  const fromNeo4j = await fetchFarmerSubgraphFromNeo4j(rootId, depth);
  if (fromNeo4j?.nodes.length) {
    await getPersistence().saveGraphByFarmerId(rootId, fromNeo4j);
    return fromNeo4j;
  }

  const db = await getDb();
  const local = db.graphs[rootId] ?? { nodes: [], edges: [] };
  return { ...local, meta: { source: "local", depth } };
}

export async function verifyNeo4jConnectivity(): Promise<Neo4jStatus> {
  const activeDriver = getNeo4jDriver();
  const profile = serverEnv.neo4jProfile();
  const database = serverEnv.neo4jDatabase();

  if (!activeDriver) {
    return { connected: false, message: "Neo4j credentials are not configured." };
  }

  const session = openNeo4jSession(activeDriver);
  try {
    await session.run("RETURN 1 AS ok");
    const stats = await session.run(`
      OPTIONAL MATCH (f:Farmer)
      WITH count(f) AS farmers
      OPTIONAL MATCH ()-[r]->()
      RETURN farmers, count(r) AS relationships
    `);
    const record = stats.records[0];
    return {
      connected: true,
      message: "Neo4j connection verified.",
      profile,
      database,
      farmerNodes: Number(record?.get("farmers") ?? 0),
      relationshipCount: Number(record?.get("relationships") ?? 0),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neo4j connectivity check failed.";
    return { connected: false, message, profile, database };
  } finally {
    await session.close();
  }
}
