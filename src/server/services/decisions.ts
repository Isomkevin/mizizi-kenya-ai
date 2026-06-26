import type { DecisionDetail } from "@/api/types";
import { getPersistence } from "@/server/services/persistence";

export type DecisionListInput = {
  status?: DecisionDetail["status"];
  limit?: number;
};

export type SubmitDecisionInput = {
  id: string;
  status: DecisionDetail["status"];
  recommendation: DecisionDetail["recommendation"];
  officerExplanation?: string;
  overrideReason?: string;
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
  return decision ?? null;
}

export async function submitDecision(input: SubmitDecisionInput): Promise<DecisionDetail> {
  const persistence = getPersistence();
  const current = await persistence.getDecisionById(input.id);
  if (!current) {
    throw new Error(`Decision ${input.id} not found`);
  }

  const updated: DecisionDetail = {
    ...current,
    status: input.status,
    recommendation: input.recommendation,
    officerExplanation: input.officerExplanation ?? current.officerExplanation,
    overrideReason: input.overrideReason ?? current.overrideReason,
  };

  await persistence.upsertDecision(updated);
  return updated;
}
