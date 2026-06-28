import type { DecisionDetail, FarmerProfile } from "@/api/types";
import { normalizeDecisionId, normalizeFarmerId } from "@/lib/id-aliases";
import { buildSeedDatabase } from "@/lib/seed-data";

let cached: ReturnType<typeof buildSeedDatabase> | null = null;

function demoDb() {
  if (!cached) cached = buildSeedDatabase();
  return cached;
}

export function findDemoFarmer(id: string): FarmerProfile | null {
  const normalized = normalizeFarmerId(id);
  return (
    demoDb().farmers.find(
      (farmer) => farmer.id === normalized || farmer.farmerId === normalized,
    ) ?? null
  );
}

export function findDemoDecision(id: string): DecisionDetail | null {
  const normalized = normalizeDecisionId(id);
  const direct = demoDb().decisions.find((decision) => decision.id === normalized);
  if (direct) return direct;

  for (const farmer of demoDb().farmers) {
    const nested = farmer.decisions.find((decision) => decision.id === normalized);
    if (!nested) continue;
    const full = demoDb().decisions.find((decision) => decision.id === normalized);
    if (full) return full;
    return {
      id: nested.id,
      farmerId: farmer.id,
      farmerName: farmer.name,
      applicationId: nested.applicationId,
      recommendation: nested.recommendation as DecisionDetail["recommendation"],
      confidence: nested.confidence,
      risk: nested.risk,
      status: nested.status as DecisionDetail["status"],
      factors: farmer.contributingFactors,
      positiveSignals: ["Verified identity and cooperative membership"],
      negativeSignals: ["Climate volatility on county baseline"],
      officerExplanation: `Decision prepared for ${farmer.name} using risk, climate, and relationship evidence.`,
      farmerExplanation:
        "Your application outcome is based on repayment behavior, farm profile, and current climate expectations.",
      createdAt: nested.createdAt,
    };
  }

  return null;
}

export function listDemoDecisions(
  status?: DecisionDetail["status"],
  limit = 50,
): DecisionDetail[] {
  return demoDb()
    .decisions.filter((decision) => (status ? decision.status === status : true))
    .slice(0, limit);
}

export function listDemoFarmers(limit = 250): FarmerProfile[] {
  return demoDb().farmers.slice(0, limit);
}
