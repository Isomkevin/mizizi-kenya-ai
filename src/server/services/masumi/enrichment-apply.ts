import type { FarmerProfile, GraphPayload } from "@/api/types";
import { countyCoordinates } from "@/server/lib/kenya-counties";
import { getPersistence } from "@/server/services/persistence";

type EnrichmentResult = Record<string, unknown>;

function mergeRepayments(
  farmer: FarmerProfile,
  incoming: Array<{ id: string; date: string; amountKes: number; onTime: boolean }>,
): FarmerProfile["repayments"] {
  const existing = new Map(farmer.repayments.map((item) => [item.id, item]));
  for (const item of incoming) {
    existing.set(item.id, item);
  }
  return [...existing.values()].sort((a, b) => b.date.localeCompare(a.date));
}

function mergeLoans(
  farmer: FarmerProfile,
  incoming: Array<{ id: string; amountKes: number; status: string; season?: string }>,
): FarmerProfile["loans"] {
  const existing = new Map(farmer.loans.map((item) => [item.id, item]));
  for (const item of incoming) {
    existing.set(item.id, {
      id: item.id,
      amountKes: item.amountKes,
      status: item.status,
      termMonths: farmer.loans.find((l) => l.id === item.id)?.termMonths ?? 12,
    });
  }
  return [...existing.values()];
}

function appendDataSourceNode(
  graph: GraphPayload,
  farmerId: string,
  dataSourceId: string,
  enrichType: string,
  masumiTxHash: string,
): GraphPayload {
  const nodes = [...graph.nodes];
  const edges = [...graph.edges];
  if (!nodes.some((node) => node.id === dataSourceId)) {
    nodes.push({
      id: dataSourceId,
      label: `${enrichType} via Masumi`,
      type: "DataSource",
      properties: {
        source: "masumi_agent",
        enrichType,
        masumi_tx_hash: masumiTxHash,
      },
      provenance: "masumi",
    });
    edges.push({
      id: `edge-${dataSourceId}-${farmerId}`,
      source: dataSourceId,
      target: farmerId,
      type: "PROVIDED",
      properties: { masumi_tx_hash: masumiTxHash },
    });
  }
  return { nodes, edges, meta: { ...graph.meta, source: graph.meta?.source ?? "local" } };
}

export async function applyEnrichmentResult(
  farmerId: string,
  result: EnrichmentResult,
): Promise<FarmerProfile | undefined> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) return undefined;

  const enrichType = String(result.enrichType ?? "");
  const masumiTxHash = String(result.masumi_tx_hash ?? "");
  const dataSourceId = String(result.data_source_id ?? `ds-${farmerId}-${Date.now()}`);
  let updated: FarmerProfile = { ...farmer };

  if (enrichType === "CLIMATE" && result.climate && typeof result.climate === "object") {
    const climate = result.climate as {
      rainfallMm?: number;
      droughtProbability?: number;
      county?: string;
    };
    updated = {
      ...updated,
      climate: {
        ...updated.climate,
        rainfallMm: climate.rainfallMm ?? updated.climate.rainfallMm,
        droughtProbability: climate.droughtProbability ?? updated.climate.droughtProbability,
        insight: `Masumi-verified climate fetch (${masumiTxHash.slice(0, 12)}…).`,
        observations: [
          {
            date: new Date().toISOString().slice(0, 7),
            label: "Rainfall",
            value: `${climate.rainfallMm ?? 0} mm`,
          },
          ...updated.climate.observations,
        ].slice(0, 6),
      },
      sourceFreshness: "Masumi agent",
    };
  }

  if (enrichType === "COOPERATIVE") {
    if (Array.isArray(result.repayments)) {
      updated.repayments = mergeRepayments(
        updated,
        result.repayments as Array<{
          id: string;
          date: string;
          amountKes: number;
          onTime: boolean;
        }>,
      );
    }
    if (Array.isArray(result.loans)) {
      updated.loans = mergeLoans(
        updated,
        result.loans as Array<{ id: string; amountKes: number; status: string; season?: string }>,
      );
    }
    if (result.cooperative && typeof result.cooperative === "string") {
      updated.cooperative = result.cooperative;
    }
    updated.trustIndicators = [
      ...new Set([...updated.trustIndicators, "Cooperative repayment verified via Masumi"]),
    ];
  }

  if (enrichType === "MOBILE_MONEY") {
    updated.trustIndicators = [
      ...new Set([...updated.trustIndicators, "Mobile wallet regularity linked (consented)"]),
    ];
  }

  if (masumiTxHash) {
    updated.trustIndicators = [
      ...new Set([...updated.trustIndicators, `On-chain audit ${masumiTxHash.slice(0, 16)}…`]),
    ];
  }

  updated.timeline = [
    {
      id: `${farmerId}-masumi-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: "application",
      title: "Masumi agent delivery confirmed",
      description: `${enrichType} data applied with tx ${masumiTxHash.slice(0, 20) || "demo"}.`,
    },
    ...updated.timeline,
  ];

  await persistence.upsertFarmer(updated);

  const graph =
    (await persistence.getGraphByFarmerId(farmerId)) ??
    ({
      nodes: [],
      edges: [],
    } as GraphPayload);
  const enrichedGraph = appendDataSourceNode(
    graph,
    farmerId,
    dataSourceId,
    enrichType,
    masumiTxHash,
  );
  await persistence.saveGraphByFarmerId(farmerId, enrichedGraph);

  return updated;
}

export function currentSeason(): string {
  const month = new Date().getMonth() + 1;
  return month >= 3 && month <= 8 ? "LR" : "SR";
}

export function defaultCoordsForFarmer(farmer: FarmerProfile): { lat: number; lon: number } {
  return countyCoordinates(farmer.county);
}
