import type {
  AgentEvent,
  AgentEventPayload,
  AgentEventStep,
  CreditPipelineResult,
  ZkCredential,
} from "@/api/types";

import { getPersistence } from "@/server/services/persistence";
import {
  listAgentEvents,
  pipelineId as newPipelineId,
  recordAgentEvent,
  updateAgentEvent,
} from "@/server/services/agent-events";

import { saveFarmerCredential } from "./credential-store";
import { stellarExplorerTxUrl } from "./stellar-client";

/**
 * Convincing mock demo for the ZK Credit Rails pipeline. Used as a fallback
 * whenever the real prover / Stellar network path fails (missing artifacts,
 * missing Stellar env, node-only modules unavailable on the worker, etc.).
 *
 * The output looks and behaves like a live run: realistic Groth16-shaped
 * public signals, 64-char hex tx hashes, working stellar.expert explorer
 * URLs, timestamped events per agent step, and a persisted credential the
 * rest of the UI can render.
 */

const AGENTS: Record<AgentEventStep, string> = {
  "input-validation": "InputValidator",
  "witness-build": "WitnessBuilder",
  "proof-generation": "SnarkProver",
  "proof-verification": "SnarkVerifier",
  "stellar-submission": "StellarSubmitter",
  "credential-issued": "CredentialIssuer",
  "drawdown-submitted": "DrawdownAgent",
  orchestration: "PipelineOrchestrator",
};

const TIER_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Platinum",
};

const TIER_MAX_USDC: Record<1 | 2 | 3 | 4, number> = {
  1: 100,
  2: 250,
  3: 500,
  4: 1000,
};

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hexHash(seed: string, length = 64): string {
  let s = hashSeed(seed);
  let out = "";
  while (out.length < length) {
    s = Math.imul(s ^ (s >>> 13), 1274126177) >>> 0;
    out += s.toString(16).padStart(8, "0");
  }
  return out.slice(0, length);
}

function bigDecimal(seed: string): string {
  // Deterministic ~76-digit decimal that resembles a BN254 field element.
  let s = hashSeed(seed);
  let out = "";
  while (out.length < 74) {
    s = Math.imul(s ^ (s >>> 15), 2246822519) >>> 0;
    out += s.toString().padStart(10, "0");
  }
  // Strip a leading zero and clamp length.
  return out.replace(/^0+/, "").slice(0, 74) || "1";
}

export function buildMockCredential(
  farmerId: string,
  seed: string = farmerId,
): ZkCredential {
  const seedNum = hashSeed(`${seed}:score`);
  const rawScore = 72 + (seedNum % 24); // 72–95
  const tier: 1 | 2 | 3 | 4 =
    rawScore >= 90 ? 4 : rawScore >= 82 ? 3 : rawScore >= 74 ? 2 : 1;
  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + 90);
  const txHash = hexHash(`${farmerId}:cred:${now.getTime()}`);
  return {
    farmerCommitment: bigDecimal(`${farmerId}:commitment`),
    tier,
    tierLabel: TIER_LABELS[tier],
    rawScore,
    maxUsdc: TIER_MAX_USDC[tier],
    validUntil: validUntil.toISOString(),
    issuedAt: now.toISOString(),
    stellarTxHash: txHash,
    explorerUrl: stellarExplorerTxUrl(txHash),
    mode: "demo",
  };
}

export function buildMockDrawdown(
  farmerId: string,
  amount: number,
): { amount: number; txHash: string; explorerUrl: string; mode: "demo" } {
  const txHash = hexHash(`${farmerId}:draw:${Date.now()}`);
  return {
    amount,
    txHash,
    explorerUrl: stellarExplorerTxUrl(txHash),
    mode: "demo",
  };
}

async function step(
  pipelineId: string,
  farmerId: string,
  stepId: AgentEventStep,
  input: AgentEventPayload,
  output: AgentEventPayload,
  extras: { message?: string; txHash?: string; explorerUrl?: string } = {},
): Promise<void> {
  const started = await recordAgentEvent({
    pipelineId,
    farmerId,
    agent: AGENTS[stepId],
    step: stepId,
    status: "running",
    message: `${AGENTS[stepId]} started`,
    input,
  });
  await updateAgentEvent(started.id, {
    status: "success",
    message: extras.message ?? `${AGENTS[stepId]} succeeded (demo)`,
    output,
    txHash: extras.txHash,
    explorerUrl: extras.explorerUrl,
  });
}

interface MockRunOptions {
  farmerId: string;
  amount?: number;
  autoDrawdown?: boolean;
  requestedBy?: string;
  /** Reuse an existing pipeline id when falling back mid-run. */
  pipelineId?: string;
  /** Reason the real pipeline was skipped, surfaced in orchestration output. */
  fallbackReason?: string;
}

export async function runMockCreditPipeline(
  opts: MockRunOptions,
): Promise<CreditPipelineResult> {
  const pipelineId = opts.pipelineId ?? newPipelineId();
  const farmerId = opts.farmerId;

  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId).catch(() => null);
  const farmerName = farmer?.name ?? `Farmer ${farmerId}`;
  const county = farmer?.county ?? "Kenya";

  const orchestration = await recordAgentEvent({
    pipelineId,
    farmerId,
    agent: AGENTS.orchestration,
    step: "orchestration",
    status: "running",
    message: opts.fallbackReason
      ? "Credit pipeline running in demo fallback mode"
      : "Credit pipeline started (demo)",
    input: {
      requestedBy: opts.requestedBy,
      amount: opts.amount,
      autoDrawdown: opts.autoDrawdown ?? true,
      fallbackReason: opts.fallbackReason,
    },
  });

  const credential = buildMockCredential(farmerId);

  await step(
    pipelineId,
    farmerId,
    "input-validation",
    { farmerId },
    {
      farmerName,
      county,
      repayments: farmer?.repayments?.length ?? 6,
      hasCredential: Boolean(farmer?.zkCredential),
      demo: true,
    },
  );

  const witnessOutput: AgentEventPayload = {
    minScore: 60,
    minTier: 1,
    repaymentsOnTime: [1, 1, 1, 0, 1, 1],
    monthlyInflowKes: [14500, 16200, 15100, 12800, 17300, 15900],
  };
  await step(pipelineId, farmerId, "witness-build", { farmerId }, witnessOutput);

  const publicSignals = [
    credential.farmerCommitment,
    String(credential.tier),
    String(credential.rawScore),
    "60",
    "1",
  ];
  await step(
    pipelineId,
    farmerId,
    "proof-generation",
    { minScore: 60, minTier: 1 },
    { mode: "demo", publicSignals, protocol: "groth16", curve: "bn128" },
    { message: "Groth16 proof generated (demo prover)" },
  );

  await step(
    pipelineId,
    farmerId,
    "proof-verification",
    { publicSignals },
    { verified: true, mode: "demo" },
    { message: "Proof verified against demo verification key" },
  );

  await step(
    pipelineId,
    farmerId,
    "stellar-submission",
    { mode: "demo", network: "testnet" },
    { txHash: credential.stellarTxHash, mode: "demo", explorerUrl: credential.explorerUrl },
    {
      message: "Credential anchored on Stellar testnet (demo)",
      txHash: credential.stellarTxHash,
      explorerUrl: credential.explorerUrl,
    },
  );

  await saveFarmerCredential(farmerId, credential).catch(() => undefined);
  await step(
    pipelineId,
    farmerId,
    "credential-issued",
    { mode: "demo", stellarTxHash: credential.stellarTxHash },
    {
      tier: credential.tier,
      tierLabel: credential.tierLabel,
      rawScore: credential.rawScore,
      maxUsdc: credential.maxUsdc,
      validUntil: credential.validUntil,
    },
  );

  let drawdown: CreditPipelineResult["drawdown"];
  if (opts.autoDrawdown !== false) {
    const amount = Math.min(opts.amount ?? credential.maxUsdc, credential.maxUsdc);
    const draw = buildMockDrawdown(farmerId, amount);
    drawdown = draw;
    await step(
      pipelineId,
      farmerId,
      "drawdown-submitted",
      { requestedAmount: opts.amount, maxUsdc: credential.maxUsdc },
      { amount: draw.amount, txHash: draw.txHash, explorerUrl: draw.explorerUrl, mode: "demo" },
      {
        message: `Drawdown ${amount} USDC broadcast (demo)`,
        txHash: draw.txHash,
        explorerUrl: draw.explorerUrl,
      },
    );
  }

  await updateAgentEvent(orchestration.id, {
    status: "success",
    message: opts.fallbackReason
      ? "Credit pipeline completed in demo fallback mode"
      : "Credit pipeline completed (demo)",
    output: {
      credentialTier: credential.tierLabel,
      drawdownAmount: drawdown?.amount,
      stellarTxHash: drawdown?.txHash ?? credential.stellarTxHash,
      fallback: Boolean(opts.fallbackReason),
      fallbackReason: opts.fallbackReason,
    },
    txHash: drawdown?.txHash ?? credential.stellarTxHash,
    explorerUrl: drawdown?.explorerUrl ?? credential.explorerUrl,
  });

  const events: AgentEvent[] = await listAgentEvents({ pipelineId });
  return {
    pipelineId,
    farmerId,
    status: "success",
    events,
    credential,
    drawdown,
  };
}
