import type { DataGapId, FarmerProfile, RequestEnrichmentInput } from "@/api/types";
import { countyCoordinates } from "@/server/lib/kenya-counties";
import { refreshClimate } from "@/server/services/analytics";
import {
  computeCompletenessFromGaps,
  deriveEnrichmentStatus,
  detectDataGaps,
} from "@/server/services/gap-detector";
import { getPersistence } from "@/server/services/persistence";
import { assessFarmerRisk } from "@/server/services/risk-engine";

export async function syncFarmerDataGaps(farmer: FarmerProfile): Promise<FarmerProfile> {
  const persistence = getPersistence();
  const graph = await persistence.getGraphByFarmerId(farmer.id);
  const jobs = farmer.enrichmentJobs ?? [];
  const dataGaps = detectDataGaps(farmer, graph, jobs);
  const dataCompleteness = Math.round(computeCompletenessFromGaps(dataGaps) * 100);
  const enrichmentStatus = deriveEnrichmentStatus(dataGaps, jobs);
  const insufficientData = dataCompleteness < 70;

  const updated: FarmerProfile = {
    ...farmer,
    dataGaps,
    dataCompleteness,
    enrichmentStatus,
    insufficientData,
  };

  const assessment = assessFarmerRisk(updated);
  return {
    ...updated,
    risk: assessment.risk,
    confidence: assessment.confidence,
    contributingFactors: assessment.factors.length
      ? assessment.factors
      : updated.contributingFactors,
    recommendation: assessment.recommendation,
  };
}

async function fulfillClimateGap(farmer: FarmerProfile): Promise<FarmerProfile> {
  const coords = countyCoordinates(farmer.county);
  const result = await refreshClimate({
    county: farmer.county,
    lat: coords.lat,
    lon: coords.lon,
  });

  const persistence = getPersistence();
  const latest = await persistence.getFarmerById(farmer.id);
  if (!latest) return farmer;

  return {
    ...latest,
    climate: {
      ...latest.climate,
      rainfallMm: result.rainfallMm,
      droughtProbability: result.droughtProbability,
      insight: `Updated from Open-Meteo at ${new Date(result.fetchedAt).toLocaleTimeString()}.`,
      observations: [
        {
          date: new Date().toISOString().slice(0, 7),
          label: "Rainfall",
          value: `${result.rainfallMm} mm`,
        },
        ...latest.climate.observations,
      ].slice(0, 6),
    },
    sourceFreshness: "Just now",
  };
}

export async function requestFarmerEnrichment(
  input: RequestEnrichmentInput,
): Promise<FarmerProfile> {
  const persistence = getPersistence();
  let farmer = await persistence.getFarmerById(input.farmerId);
  if (!farmer) {
    throw new Error("Farmer profile not found.");
  }

  farmer = await syncFarmerDataGaps(farmer);
  const targetGapIds =
    input.gapIds ??
    (farmer.dataGaps ?? [])
      .filter((gap) => gap.status === "missing" && gap.enrichType)
      .map((gap) => gap.id);

  if (!targetGapIds.length) {
    return farmer;
  }

  const now = new Date().toISOString();
  const jobs = [...(farmer.enrichmentJobs ?? [])];

  for (const gapId of targetGapIds) {
    const gap = farmer.dataGaps?.find((item) => item.id === gapId);
    if (!gap || gap.status === "present" || !gap.enrichType) continue;

    const alreadyQueued = jobs.some(
      (job) => job.gapId === gapId && (job.status === "queued" || job.status === "running"),
    );
    if (alreadyQueued) continue;

    jobs.push({
      id: `${farmer.id}-enrich-${gapId}-${Date.now()}`,
      gapId: gapId as DataGapId,
      enrichType: gap.enrichType,
      status: "queued",
      requestedAt: now,
      requestedBy: "officer",
      message: `Enrichment requested for ${gap.label}.`,
    });
  }

  farmer = {
    ...farmer,
    enrichmentJobs: jobs,
    timeline: [
      {
        id: `${farmer.id}-enrich-${Date.now()}`,
        timestamp: now,
        category: "application",
        title: "Data enrichment requested",
        description: `Officer requested ${targetGapIds.length} missing signal${targetGapIds.length === 1 ? "" : "s"}.`,
      },
      ...farmer.timeline,
    ],
  };

  await persistence.upsertFarmer(farmer);

  if (targetGapIds.includes("climate_zone")) {
    farmer = await fulfillClimateGap(farmer);
    const climateJobs = (farmer.enrichmentJobs ?? []).map((job) =>
      job.gapId === "climate_zone" && job.status === "queued"
        ? {
            ...job,
            status: "complete" as const,
            message: "Climate refreshed from Open-Meteo.",
          }
        : job,
    );
    farmer = { ...farmer, enrichmentJobs: climateJobs };
    farmer.timeline = [
      {
        id: `${farmer.id}-climate-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: "climate",
        title: "Climate signals refreshed",
        description: `County climate updated for ${farmer.county}.`,
      },
      ...farmer.timeline,
    ];
    await persistence.upsertFarmer(farmer);
  }

  const synced = await syncFarmerDataGaps(farmer);
  await persistence.upsertFarmer(synced);
  return synced;
}
