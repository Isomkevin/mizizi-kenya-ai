import type { CreateFarmerInput, FarmerProfile, SearchResult } from "@/api/types";
import { normalizeFarmerId } from "@/server/id-aliases";
import { serverEnv } from "@/server/env";
import { getPersistence } from "@/server/services/persistence";
import { assessFarmerRisk, computeBaseRiskAssessment } from "@/server/services/risk-engine";
import { syncFarmerDataGaps } from "@/server/services/farmer-gaps";

export type FarmerSearchInput = {
  query?: string;
  county?: string;
  risk?: FarmerProfile["risk"];
  limit?: number;
};

export async function searchFarmers(input: FarmerSearchInput = {}): Promise<FarmerProfile[]> {
  const farmers = await getPersistence().listFarmers();
  const query = input.query?.trim().toLowerCase();
  const county = input.county?.trim().toLowerCase();

  return farmers
    .filter((farmer) => {
      if (input.risk && farmer.risk !== input.risk) return false;
      if (county && farmer.county.toLowerCase() !== county) return false;
      if (!query) return true;
      return (
        farmer.name.toLowerCase().includes(query) ||
        farmer.farmerId.toLowerCase().includes(query) ||
        farmer.cooperative.toLowerCase().includes(query)
      );
    })
    .slice(0, input.limit ?? 30);
}

export async function getFarmer(id: string): Promise<FarmerProfile | null> {
  const farmer = await getPersistence().getFarmerById(normalizeFarmerId(id));
  if (!farmer) return null;
  if (serverEnv.demoMode()) {
    return farmer;
  }
  try {
    const synced = await syncFarmerDataGaps(farmer);
    await getPersistence().upsertFarmer(synced);
    return synced;
  } catch {
    return farmer;
  }
}

function toSearchResult(farmer: FarmerProfile): SearchResult {
  return {
    id: farmer.id,
    type: "farmer",
    title: farmer.name,
    subtitle: `${farmer.cropType} · ${farmer.parcelHa ?? 0} ha`,
    location: farmer.county,
    status: farmer.decisionStatus,
    risk: farmer.risk,
    href: `/app/farmers/${farmer.id}`,
    recentActivity: farmer.timeline[0]?.title,
  };
}

function buildNewFarmerProfile(input: CreateFarmerInput, id: string): FarmerProfile {
  const now = new Date().toISOString();
  const draft: FarmerProfile = {
    id,
    farmerId: input.farmerId,
    name: input.name,
    county: input.county,
    cooperative: input.cooperative,
    cropType: input.cropType,
    phone: input.phone,
    risk: "medium",
    confidence: 0.72,
    verificationStatus: "pending",
    decisionStatus: "New profile",
    graphConnections: 0,
    climateIndicator: "Baseline pending",
    applicationStatus: "draft",
    dataCompleteness: 42,
    dataGaps: [],
    enrichmentStatus: "none",
    enrichmentJobs: [],
    insufficientData: true,
    sourceFreshness: "Just now",
    trustIndicators: ["Profile created in Mizizi"],
    contributingFactors: [],
    repayments: [],
    loans: [],
    applications: [],
    decisions: [],
    timeline: [
      {
        id: `${id}-tl-1`,
        timestamp: now,
        category: "application",
        title: "Profile created",
        description: `Farmer profile registered for ${input.name}.`,
      },
    ],
    documents: [],
    communications: [],
    climate: {
      rainfallMm: 0,
      droughtProbability: 0.25,
      ndvi: 0.5,
      insight: "Climate baseline will populate after first refresh.",
      observations: [],
    },
  };

  const assessment = computeBaseRiskAssessment(draft);
  return {
    ...draft,
    risk: assessment.risk,
    confidence: assessment.confidence,
    contributingFactors: assessment.factors,
    recommendation: assessment.recommendation,
    officerRecommendation: "Complete identity verification and cooperative linkage.",
  };
}

export async function createFarmer(input: CreateFarmerInput): Promise<FarmerProfile> {
  const persistence = getPersistence();
  const farmers = await persistence.listFarmers();

  const duplicate = farmers.find(
    (farmer) => farmer.farmerId.toLowerCase() === input.farmerId.trim().toLowerCase(),
  );
  if (duplicate) {
    throw new Error("A farmer with this ID already exists.");
  }

  const nextIndex = farmers.length + 1;
  const id = `f-${String(nextIndex).padStart(3, "0")}`;
  const profile = buildNewFarmerProfile(input, id);

  await persistence.upsertFarmer(profile);

  const synced = await syncFarmerDataGaps(profile);
  await persistence.upsertFarmer(synced);

  const db = await persistence.getDb();
  db.searchIndex = db.searchIndex.filter((entry) => entry.id !== synced.id);
  db.searchIndex.unshift(toSearchResult(synced));
  await persistence.saveDb(db);

  return synced;
}
