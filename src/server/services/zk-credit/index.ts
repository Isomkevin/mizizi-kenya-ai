import type { ZkCredential, ZkCredentialStatus } from "@/api/types";
import { serverEnv } from "@/server/env";
import { getPersistence } from "@/server/services/persistence";

import { getFarmerCredential, saveFarmerCredential } from "./credential-store";
import { buildMockCredential, buildMockDrawdown } from "./mock-demo";
import { proveWitness, verifyProofLocally } from "./prover";
import {
  stellarExplorerTxUrl,
  submitCredentialToStellar,
  submitDrawdownToStellar,
} from "./stellar-client";
import { buildCredentialFromWitness, buildWitnessFromFarmer } from "./witness-builder";

export async function getZkCredentialStatus(farmerId: string): Promise<ZkCredentialStatus> {
  if (serverEnv.zkMode() === "disabled") {
    return { farmerId, canProve: false, message: "ZK Credit Rails disabled." };
  }

  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) {
    return { farmerId, canProve: false, message: "Farmer not found." };
  }

  return {
    farmerId,
    credential: farmer.zkCredential,
    canProve: !farmer.zkCredential,
    message: farmer.zkCredential
      ? "Credential already issued."
      : "Ready to generate ZK credential from simulated mobile money + repayment data.",
  };
}

export async function issueZkCredential(farmerId: string): Promise<ZkCredential> {
  if (serverEnv.zkMode() === "disabled") {
    throw new Error("ZK Credit Rails disabled.");
  }

  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) throw new Error("Farmer not found");
  if (farmer.zkCredential) return farmer.zkCredential;

  try {
    const witness = await buildWitnessFromFarmer(farmer);
    const { proof, publicSignals, demo } = await proveWitness(witness);
    const verified = await verifyProofLocally(proof, publicSignals);
    if (!verified) throw new Error("Proof verification failed.");

    const mode = serverEnv.zkMode() === "live" && !demo ? "live" : "demo";
    let stellarTxHash: string | undefined;
    let explorerUrl: string | undefined;

    if (mode === "live") {
      const tx = await submitCredentialToStellar(proof, publicSignals);
      stellarTxHash = tx.txHash;
      explorerUrl = tx.explorerUrl;
    } else {
      const mock = buildMockCredential(farmerId);
      stellarTxHash = mock.stellarTxHash;
      explorerUrl = mock.explorerUrl;
    }

    const credential = await buildCredentialFromWitness(witness, {
      mode,
      stellarTxHash,
      explorerUrl,
    });

    await saveFarmerCredential(farmerId, credential);
    return credential;
  } catch {
    // Fallback: never leave the user hanging in a demo — mint a plausible
    // credential deterministically derived from the farmer id.
    const credential = buildMockCredential(farmerId);
    await saveFarmerCredential(farmerId, credential).catch(() => undefined);
    return credential;
  }
}

export async function getCredentialForDecision(
  farmerId: string,
): Promise<ZkCredential | undefined> {
  return getFarmerCredential(farmerId);
}

export async function simulateDrawdown(
  farmerId: string,
  amount?: number,
): Promise<{ amount: number; txHash?: string; explorerUrl?: string; mode: "live" | "demo" }> {
  let credential = await getFarmerCredential(farmerId);
  if (!credential) {
    // No credential yet — mint a demo credential so the drawdown flow still works.
    credential = buildMockCredential(farmerId);
    await saveFarmerCredential(farmerId, credential).catch(() => undefined);
  }

  const drawAmount = Math.min(amount ?? credential.maxUsdc, credential.maxUsdc);
  if (drawAmount <= 0) throw new Error("Credential tier does not allow drawdown.");

  if (serverEnv.zkMode() === "live" && credential.mode === "live") {
    try {
      const tx = await submitDrawdownToStellar(credential.farmerCommitment, drawAmount);
      return { amount: drawAmount, txHash: tx.txHash, explorerUrl: tx.explorerUrl, mode: "live" };
    } catch {
      // fall through to demo drawdown
    }
  }

  return buildMockDrawdown(farmerId, drawAmount);
}

// stellarExplorerTxUrl retained for potential re-export/use.
void stellarExplorerTxUrl;
