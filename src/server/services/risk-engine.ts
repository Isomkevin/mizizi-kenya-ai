import type { DecisionDetail, DecisionFactor, FarmerProfile, RiskLevel } from "@/api/types";

export interface RiskAssessment {
  recommendation: DecisionDetail["recommendation"];
  risk: RiskLevel;
  confidence: number;
  factors: DecisionFactor[];
  positiveSignals: string[];
  negativeSignals: string[];
}

const SCORE_TO_RISK: Array<{ max: number; level: RiskLevel }> = [
  { max: 24, level: "very-low" },
  { max: 39, level: "low" },
  { max: 59, level: "medium" },
  { max: 79, level: "high" },
  { max: Number.POSITIVE_INFINITY, level: "critical" },
];

function normalizeFactors(factors: DecisionFactor[]): DecisionFactor[] {
  if (!factors.length) return [];
  const total = factors.reduce((sum, factor) => sum + Math.abs(factor.weight), 0) || 1;
  return factors.map((factor) => ({
    ...factor,
    weight: Number((Math.abs(factor.weight) / total).toFixed(3)),
  }));
}

function recommendationForRisk(risk: RiskLevel): DecisionDetail["recommendation"] {
  switch (risk) {
    case "very-low":
    case "low":
      return "approve";
    case "medium":
      return "approve_with_conditions";
    case "high":
      return "request_info";
    case "critical":
      return "decline";
  }
}

function confidenceForScore(score: number): number {
  const value = 0.98 - Math.min(0.38, score / 260);
  return Number(Math.max(0.55, Math.min(0.98, value)).toFixed(2));
}

export function assessFarmerRisk(farmer: FarmerProfile): RiskAssessment {
  const droughtPenalty = Math.round(farmer.climate.droughtProbability * 35);
  const overduePenalty = farmer.repayments.some((repayment) => !repayment.onTime) ? 14 : 0;
  const completenessPenalty = Math.max(0, Math.round((100 - farmer.dataCompleteness) / 2.5));
  const graphBonus = Math.min(12, Math.round(farmer.graphConnections / 2));
  const confidenceBonus = Math.round(farmer.confidence * 8);
  const score = Math.max(
    0,
    droughtPenalty + overduePenalty + completenessPenalty - graphBonus - confidenceBonus,
  );
  const risk = SCORE_TO_RISK.find((band) => score <= band.max)?.level ?? "critical";

  const factors = normalizeFactors([
    {
      id: `${farmer.id}-rf-climate`,
      label: "Climate stress",
      direction: droughtPenalty > 12 ? "negative" : "positive",
      weight: Math.max(0.08, droughtPenalty / 100),
      confidence: 0.9,
      source: "climate_observations",
      graphPath: [farmer.id, `zone-${farmer.county.toLowerCase().replace(/\s+/g, "-")}`],
    },
    {
      id: `${farmer.id}-rf-repayment`,
      label: "Repayment consistency",
      direction: overduePenalty > 0 ? "negative" : "positive",
      weight: 0.28,
      confidence: 0.94,
      source: "repayment_history",
      graphPath: [farmer.id, `loan-${farmer.id}`],
    },
    {
      id: `${farmer.id}-rf-data`,
      label: "Profile completeness",
      direction: completenessPenalty > 8 ? "negative" : "positive",
      weight: 0.16,
      confidence: 0.88,
      source: "profile_quality",
    },
    {
      id: `${farmer.id}-rf-network`,
      label: "Network strength",
      direction: graphBonus >= 7 ? "positive" : "negative",
      weight: 0.24,
      confidence: 0.86,
      source: "graph_topology",
      graphPath: [farmer.id, `coop-${farmer.id}`],
    },
    ...farmer.contributingFactors.slice(0, 2),
  ]);

  const positiveSignals = [
    farmer.verificationStatus === "verified" ? "Identity and cooperative records verified." : "",
    farmer.repayments.every((repayment) => repayment.onTime)
      ? "No late repayments detected in recent history."
      : "",
    farmer.graphConnections >= 10 ? "Strong relationship graph coverage." : "",
  ].filter(Boolean);

  const negativeSignals = [
    farmer.climate.droughtProbability >= 0.4 ? "County drought pressure is elevated." : "",
    farmer.dataCompleteness < 85 ? "Profile data completeness is below target threshold." : "",
    farmer.repayments.some((repayment) => !repayment.onTime)
      ? "At least one repayment event was late."
      : "",
  ].filter(Boolean);

  return {
    recommendation: recommendationForRisk(risk),
    risk,
    confidence: confidenceForScore(score),
    factors,
    positiveSignals,
    negativeSignals,
  };
}
