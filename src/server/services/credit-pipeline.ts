import type {
  AgentEvent,
  AgentEventPayload,
  AgentEventStep,
  CreditPipelineResult,
  PipelineRunSummary,
  ZkCredential,
} from "@/api/types";

import { serverEnv } from "@/server/env";
import { getPersistence } from "@/server/services/persistence";
import {
  listAgentEvents,
  pipelineId as newPipelineId,
  recordAgentEvent,
  updateAgentEvent,
} from "@/server/services/agent-events";
import { saveFarmerCredential } from "./zk-credit/credential-store";
import { runMockCreditPipeline } from "./zk-credit/mock-demo";
import { proveWitness, verifyProofLocally } from "./zk-credit/prover";
import {
  stellarExplorerTxUrl,
  submitCredentialToStellar,
  submitDrawdownToStellar,
} from "./zk-credit/stellar-client";
import {
  buildCredentialFromWitness,
  buildWitnessFromFarmer,
} from "./zk-credit/witness-builder";

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

interface RunOptions {
  farmerId: string;
  amount?: number;
  autoDrawdown?: boolean;
  requestedBy?: string;
}

export async function runCreditPipeline(opts: RunOptions): Promise<CreditPipelineResult> {
  const pipelineId = newPipelineId();
  const farmerId = opts.farmerId;

  const run = async <T>(
    step: AgentEventStep,
    input: AgentEventPayload,
    fn: () => Promise<{ output: AgentEventPayload; result: T; message?: string; txHash?: string; explorerUrl?: string }>,
  ): Promise<T> => {
    const started = await recordAgentEvent({
      pipelineId,
      farmerId,
      agent: AGENTS[step],
      step,
      status: "running",
      message: `${AGENTS[step]} started`,
      input,
    });
    try {
      const { output, result, message, txHash, explorerUrl } = await fn();
      await updateAgentEvent(started.id, {
        status: "success",
        message: message ?? `${AGENTS[step]} succeeded`,
        output,
        txHash,
        explorerUrl,
      });
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await updateAgentEvent(started.id, {
        status: "failed",
        message: `${AGENTS[step]} failed`,
        error: errorMsg,
      });
      throw err;
    }
  };

  const orchestration = await recordAgentEvent({
    pipelineId,
    farmerId,
    agent: AGENTS.orchestration,
    step: "orchestration",
    status: "running",
    message: "Credit pipeline started",
    input: { requestedBy: opts.requestedBy, amount: opts.amount, autoDrawdown: opts.autoDrawdown ?? true },
  });

  try {
    // 1. Input validation
    const farmer = await run("input-validation", { farmerId }, async () => {
      if (serverEnv.zkMode() === "disabled") throw new Error("ZK Credit Rails disabled.");
      const persistence = getPersistence();
      const f = await persistence.getFarmerById(farmerId);
      if (!f) throw new Error("Farmer not found");
      if (!f.repayments?.length) throw new Error("Farmer has no repayment history");
      return {
        output: {
          farmerName: f.name,
          county: f.county,
          repayments: f.repayments.length,
          hasCredential: Boolean(f.zkCredential),
        },
        result: f,
      };
    });

    // 2. Witness build
    const witness = await run("witness-build", { farmerId }, async () => {
      const w = await buildWitnessFromFarmer(farmer);
      return {
        output: {
          minScore: w.minScore,
          minTier: w.minTier,
          repaymentsOnTime: w.repaymentsOnTime,
        },
        result: w,
      };
    });

    // 3. Proof generation
    const proofBundle = await run(
      "proof-generation",
      { minScore: witness.minScore, minTier: witness.minTier },
      async () => {
        const bundle = await proveWitness(witness);
        return {
          output: {
            mode: bundle.demo ? "demo" : "live",
            publicSignals: bundle.publicSignals,
          },
          result: bundle,
        };
      },
    );

    // 4. Proof verification
    await run(
      "proof-verification",
      { publicSignals: proofBundle.publicSignals },
      async () => {
        const verified = await verifyProofLocally(proofBundle.proof, proofBundle.publicSignals);
        if (!verified) throw new Error("Proof verification failed");
        return { output: { verified: true }, result: true };
      },
    );

    // 5. Stellar submission for credential
    const mode: "live" | "demo" =
      serverEnv.zkMode() === "live" && !proofBundle.demo ? "live" : "demo";
    const stellar = await run(
      "stellar-submission",
      { mode, network: serverEnv.stellarNetwork?.() ?? "testnet" },
      async () => {
        if (mode === "live") {
          const tx = await submitCredentialToStellar(
            proofBundle.proof,
            proofBundle.publicSignals,
          );
          return {
            output: { txHash: tx.txHash, explorerUrl: tx.explorerUrl },
            result: { txHash: tx.txHash as string | undefined, explorerUrl: tx.explorerUrl as string | undefined },
            txHash: tx.txHash,
            explorerUrl: tx.explorerUrl,
            message: "Credential anchored on Stellar",
          };
        }
        const demoHash = `demo-${farmerId}-${Date.now()}`;
        return {
          output: { txHash: demoHash, mode: "demo" },
          result: { txHash: demoHash as string | undefined, explorerUrl: undefined as string | undefined },
          txHash: demoHash,
          explorerUrl: stellarExplorerTxUrl(demoHash),
          message: "Demo credential anchor recorded",
        };
      },
    );

    // 6. Persist credential
    const credential: ZkCredential = await run(
      "credential-issued",
      { mode, stellarTxHash: stellar.txHash },
      async () => {
        const cred = await buildCredentialFromWitness(witness, {
          mode,
          stellarTxHash: stellar.txHash,
          explorerUrl: stellar.explorerUrl,
        });
        await saveFarmerCredential(farmerId, cred);
        return {
          output: {
            tier: cred.tier,
            tierLabel: cred.tierLabel,
            rawScore: cred.rawScore,
            maxUsdc: cred.maxUsdc,
            validUntil: cred.validUntil,
          },
          result: cred,
        };
      },
    );

    // 7. Auto drawdown
    let drawdown: CreditPipelineResult["drawdown"];
    if (opts.autoDrawdown !== false) {
      drawdown = await run<{ amount: number; txHash?: string; explorerUrl?: string; mode: "live" | "demo" }>(
        "drawdown-submitted",
        { requestedAmount: opts.amount, maxUsdc: credential.maxUsdc },
        async () => {
          const amount = Math.min(opts.amount ?? credential.maxUsdc, credential.maxUsdc);
          if (amount <= 0) throw new Error("Credential tier does not allow drawdown");
          if (serverEnv.zkMode() === "live" && credential.mode === "live") {
            const tx = await submitDrawdownToStellar(credential.farmerCommitment, amount);
            const r = { amount, txHash: tx.txHash, explorerUrl: tx.explorerUrl, mode: "live" as const };
            return {
              output: { ...r },
              result: r,
              txHash: tx.txHash,
              explorerUrl: tx.explorerUrl,
              message: `Drawdown ${amount} USDC broadcast`,
            };
          }
          const demoTx = `demo-drawdown-${farmerId}-${Date.now()}`;
          const r = {
            amount,
            txHash: demoTx,
            explorerUrl: stellarExplorerTxUrl(demoTx),
            mode: "demo" as const,
          };
          return {
            output: { ...r },
            result: r,
            txHash: demoTx,
            explorerUrl: r.explorerUrl,
            message: `Demo drawdown ${amount} USDC recorded`,
          };
        },
      );
    }

    await updateAgentEvent(orchestration.id, {
      status: "success",
      message: "Credit pipeline completed",
      output: {
        credentialTier: credential.tierLabel,
        drawdownAmount: drawdown?.amount,
        stellarTxHash: stellar.txHash,
      },
      txHash: drawdown?.txHash ?? stellar.txHash,
      explorerUrl: drawdown?.explorerUrl ?? stellar.explorerUrl,
    });

    const events = await listAgentEvents({ pipelineId });
    return {
      pipelineId,
      farmerId,
      status: "success",
      events,
      credential,
      drawdown,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await updateAgentEvent(orchestration.id, {
      status: "failed",
      message: "Credit pipeline failed",
      error: errorMsg,
    });
    const events = await listAgentEvents({ pipelineId });
    return {
      pipelineId,
      farmerId,
      status: "failed",
      events,
      error: errorMsg,
    };
  }
}

export async function getPipelineEvents(pipelineId: string): Promise<AgentEvent[]> {
  return listAgentEvents({ pipelineId, limit: 200 });
}

export async function getRecentAgentEvents(limit = 50): Promise<AgentEvent[]> {
  return listAgentEvents({ limit });
}

export async function listRecentPipelines(limit = 20): Promise<PipelineRunSummary[]> {
  const events = await listAgentEvents({ limit: 500 });
  const groups = new Map<string, AgentEvent[]>();
  for (const ev of events) {
    if (!groups.has(ev.pipelineId)) groups.set(ev.pipelineId, []);
    groups.get(ev.pipelineId)!.push(ev);
  }
  const persistence = getPersistence();
  const summaries: PipelineRunSummary[] = [];
  for (const [pipelineId, evs] of groups) {
    const sorted = [...evs].sort(
      (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    );
    const orch = sorted.find((e) => e.step === "orchestration") ?? sorted[0];
    const verify = sorted.find((e) => e.step === "proof-verification");
    const stellar = sorted.find((e) => e.step === "stellar-submission");
    const credential = sorted.find((e) => e.step === "credential-issued");
    const drawdown = sorted.find((e) => e.step === "drawdown-submitted");
    const failed = sorted.find((e) => e.status === "failed");
    const farmerId = orch.farmerId;
    let farmerName: string | undefined;
    try {
      const f = await persistence.getFarmerById(farmerId);
      farmerName = f?.name;
    } catch {
      // ignore
    }
    summaries.push({
      pipelineId,
      farmerId,
      farmerName,
      startedAt: orch.startedAt,
      completedAt: orch.completedAt,
      durationMs: orch.durationMs,
      status: orch.status,
      proofVerified: verify?.status === "success",
      stellarTxHash: stellar?.txHash,
      stellarExplorerUrl: stellar?.explorerUrl,
      stellarMode:
        (stellar?.output?.mode as "live" | "demo" | undefined) ??
        (stellar?.input?.mode as "live" | "demo" | undefined),
      drawdownAmount: drawdown?.output?.amount as number | undefined,
      drawdownTxHash: drawdown?.txHash,
      drawdownExplorerUrl: drawdown?.explorerUrl,
      credentialTier: credential?.output?.tierLabel as string | undefined,
      steps: sorted.length,
      failedStep: failed?.step,
      error: failed?.error ?? orch.error,
    });
  }
  return summaries
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

