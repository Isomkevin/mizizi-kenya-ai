import type { FarmerProfile, ZkCredential } from "@/api/types";
import {
  DEFAULT_MIN_SCORE,
  DEFAULT_MIN_TIER,
  maxUsdcForTier,
  tierFromRawScore,
  TIER_LABELS,
} from "../../../../zk/lib/scoring";
import { farmerCommitment, type WitnessJson } from "../../../../zk/lib/witness";

const DEMO_SALT_PREFIX = "mizizi-demo-salt-";

export function padRepayments(farmer: FarmerProfile): number[] {
  const flags = farmer.repayments.map((r) => (r.onTime ? 1 : 0));
  while (flags.length < 6) {
    flags.push(flags.at(-1) ?? 0);
  }
  return flags.slice(0, 6);
}

export function deriveMonthlyInflows(farmer: FarmerProfile): number[] {
  const base = farmer.repayments.map((r) => r.amountKes);
  const seed = farmer.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const inflows: number[] = [];
  for (let i = 0; i < 6; i++) {
    const repayment = base[i % base.length] ?? 12000;
    inflows.push(repayment + 8000 + ((seed + i * 17) % 2500));
  }
  return inflows;
}

export async function buildWitnessFromFarmer(farmer: FarmerProfile): Promise<WitnessJson> {
  return {
    farmerId: farmer.id,
    phone: farmer.phone ?? `+2547000000${farmer.id.replace(/\D/g, "").slice(-2) || "00"}`,
    salt: `${DEMO_SALT_PREFIX}${farmer.id}`,
    repaymentsOnTime: padRepayments(farmer),
    monthlyInflowKes: deriveMonthlyInflows(farmer),
    minScore: DEFAULT_MIN_SCORE,
    minTier: DEFAULT_MIN_TIER,
  };
}

export async function buildCredentialFromWitness(
  witness: WitnessJson,
  options: { mode: "live" | "demo"; stellarTxHash?: string; explorerUrl?: string },
): Promise<ZkCredential> {
  const { computeRawScore } = await import("../../../../zk/lib/scoring");
  const rawScore = computeRawScore(witness);
  const tier = tierFromRawScore(rawScore);
  const commitment = await farmerCommitment(witness.phone, witness.salt);
  const issuedAt = new Date();
  const validUntil = new Date(issuedAt);
  validUntil.setDate(validUntil.getDate() + 90);

  return {
    farmerCommitment: commitment,
    tier,
    tierLabel: TIER_LABELS[tier],
    rawScore,
    maxUsdc: maxUsdcForTier(tier),
    validUntil: validUntil.toISOString(),
    issuedAt: issuedAt.toISOString(),
    stellarTxHash: options.stellarTxHash,
    explorerUrl: options.explorerUrl,
    mode: options.mode,
  };
}
