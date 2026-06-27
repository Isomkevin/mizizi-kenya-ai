/** Risk-officer-friendly labels for scores, factors, and recommendations. */

export const recommendationLabels: Record<string, string> = {
  approve: "Approve",
  approve_with_conditions: "Approve with conditions",
  request_info: "Request more information",
  escalate: "Escalate for review",
  decline: "Decline",
};

const factorSourceLabels: Record<string, string> = {
  graph_topology: "Cooperative & peer records",
  climate_model: "Climate data",
  repayment_history: "Repayment history",
  profile_completeness: "Application records",
};

export function formatRecommendation(recommendation: string): string {
  return recommendationLabels[recommendation] ?? recommendation.replaceAll("_", " ");
}

export function formatRecommendationStrength(confidence: number): string {
  const pct = Math.round(confidence * 100);
  if (pct >= 85) return `Strong (${pct}%)`;
  if (pct >= 70) return `Moderate (${pct}%)`;
  return `Low (${pct}%)`;
}

export function formatFactorDirection(direction: string): string {
  if (direction === "positive") return "Supports approval";
  if (direction === "negative") return "Increases risk";
  return direction;
}

export function formatFactorInfluence(weight: number): string {
  const pct = weight * 100;
  if (pct >= 30) return "Major influence";
  if (pct >= 15) return "Moderate influence";
  return "Minor influence";
}

export function formatFactorSource(source: string): string {
  return factorSourceLabels[source] ?? source.replaceAll("_", " ");
}

export function formatGraphNodeType(type: string): string {
  return type
    .replace("climatezone", "climate zone")
    .replace("inputdealer", "input dealer")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
}
