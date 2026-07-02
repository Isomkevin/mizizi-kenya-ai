/**
 * Off-chain credit score — must match zk/circuits/credit_tier.circom constraints.
 */

export const TURNOVER_FLOOR_KES = 120_000;
export const DEFAULT_MIN_SCORE = 60;
export const DEFAULT_MIN_TIER = 2;

export const TIER_MAX_USDC: Record<1 | 2 | 3 | 4, number> = {
  1: 500,
  2: 300,
  3: 150,
  4: 0,
};

export const TIER_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Excellent",
  2: "Creditworthy",
  3: "Marginal",
  4: "High risk",
};

export interface CreditWitnessInput {
  repaymentsOnTime: number[];
  monthlyInflowKes: number[];
  minScore?: number;
  minTier?: number;
}

export function computeRepaymentScore(repaymentsOnTime: number[]): number {
  const onTimeCount = repaymentsOnTime.slice(0, 6).reduce((sum, v) => sum + (v ? 1 : 0), 0);
  return Math.floor((onTimeCount * 100) / 6);
}

export function computeTurnoverScore(monthlyInflowKes: number[]): number {
  const turnoverSum = monthlyInflowKes.slice(0, 6).reduce((sum, v) => sum + v, 0);
  const turnoverRatio = turnoverSum * 100;
  if (turnoverRatio >= TURNOVER_FLOOR_KES * 100) return 100;
  return Math.floor(turnoverRatio / TURNOVER_FLOOR_KES);
}

export function computeRawScore(input: CreditWitnessInput): number {
  const repaymentScore = computeRepaymentScore(input.repaymentsOnTime);
  const turnoverScore = computeTurnoverScore(input.monthlyInflowKes);
  return Math.floor((repaymentScore * 70) / 100 + (turnoverScore * 30) / 100);
}

export function tierFromRawScore(rawScore: number): 1 | 2 | 3 | 4 {
  if (rawScore >= 80) return 1;
  if (rawScore >= 60) return 2;
  if (rawScore >= 40) return 3;
  return 4;
}

export function meetsThreshold(
  rawScore: number,
  tier: number,
  minScore = DEFAULT_MIN_SCORE,
  minTier = DEFAULT_MIN_TIER,
): boolean {
  // Lower tier number = better (1 Excellent, 4 High risk)
  return rawScore >= minScore && tier <= minTier;
}

export function maxUsdcForTier(tier: 1 | 2 | 3 | 4): number {
  return TIER_MAX_USDC[tier];
}

/** Public signal order for Groth16 — index must match circuit. */
export const PUBLIC_SIGNAL_ORDER = [
  "farmerCommitment",
  "tier",
  "rawScore",
  "minScore",
  "minTier",
] as const;

export type PublicSignalName = (typeof PUBLIC_SIGNAL_ORDER)[number];
