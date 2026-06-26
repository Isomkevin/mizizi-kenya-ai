import type { DecisionDetail, SubmitDecisionInput } from "@/api/types";
import { generateGroundedExplanation } from "@/server/services/explanation-service";
import { getPersistence } from "@/server/services/persistence";
import { assessFarmerRisk } from "@/server/services/risk-engine";

export type DecisionListInput = {
  status?: DecisionDetail["status"];
  limit?: number;
};

export async function listDecisions(input: DecisionListInput = {}): Promise<DecisionDetail[]> {
  const decisions = await getPersistence().listDecisions();
  return decisions
    .filter((decision) => (input.status ? decision.status === input.status : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, input.limit ?? 50);
}

export async function getDecision(id: string): Promise<DecisionDetail | null> {
  const decision = await getPersistence().getDecisionById(id);
  if (decision) return decision;

  const farmer = await getPersistence().getFarmerById(id);
  if (!farmer) return null;

  const assessment = assessFarmerRisk(farmer);
  const explanation = await generateGroundedExplanation({
    farmer,
    recommendation: assessment.recommendation,
    confidence: assessment.confidence,
    factors: assessment.factors,
    positiveSignals: assessment.positiveSignals,
    negativeSignals: assessment.negativeSignals,
  });

  const drafted: DecisionDetail = {
    id: `decision-${farmer.id}`,
    farmerId: farmer.id,
    farmerName: farmer.name,
    applicationId: farmer.applications[0]?.id ?? `app-${farmer.id}`,
    recommendation: assessment.recommendation,
    confidence: assessment.confidence,
    risk: assessment.risk,
    status: "pending",
    factors: assessment.factors,
    positiveSignals: assessment.positiveSignals,
    negativeSignals: assessment.negativeSignals,
    officerExplanation: explanation.officerExplanation,
    farmerExplanation: explanation.farmerExplanation,
    createdAt: new Date().toISOString(),
  };

  await getPersistence().upsertDecision(drafted);
  return drafted;
}

function normalizeSubmittedStatus(
  input: SubmitDecisionInput,
  current: DecisionDetail,
): DecisionDetail["status"] {
  if (input.status === "override") return "override";
  if (input.status === "declined") return "declined";
  if (input.status === "approved") return "approved";
  if (input.recommendation === "request_info" || input.recommendation === "escalate") {
    return "pending";
  }
  return current.status;
}

export async function submitDecision(input: SubmitDecisionInput): Promise<DecisionDetail> {
  const persistence = getPersistence();
  const current = await persistence.getDecisionById(input.id);
  if (!current) {
    throw new Error(`Decision ${input.id} not found`);
  }

  const farmer = await persistence.getFarmerById(current.farmerId);
  const assessment = farmer ? assessFarmerRisk(farmer) : null;
  const explanation = farmer
    ? await generateGroundedExplanation({
        farmer,
        recommendation: input.recommendation,
        confidence: assessment?.confidence ?? current.confidence,
        factors: assessment?.factors ?? current.factors,
        positiveSignals: assessment?.positiveSignals ?? current.positiveSignals,
        negativeSignals: assessment?.negativeSignals ?? current.negativeSignals,
      })
    : null;

  const updated: DecisionDetail = {
    ...current,
    status: normalizeSubmittedStatus(input, current),
    recommendation: input.recommendation,
    confidence: assessment?.confidence ?? current.confidence,
    risk: assessment?.risk ?? current.risk,
    factors: assessment?.factors ?? current.factors,
    positiveSignals: assessment?.positiveSignals ?? current.positiveSignals,
    negativeSignals: assessment?.negativeSignals ?? current.negativeSignals,
    officerExplanation:
      input.officerExplanation?.trim() ||
      explanation?.officerExplanation ||
      current.officerExplanation,
    farmerExplanation: explanation?.farmerExplanation ?? current.farmerExplanation,
    overrideReason: input.overrideReason ?? current.overrideReason,
  };

  await persistence.upsertDecision(updated);
  return updated;
}
