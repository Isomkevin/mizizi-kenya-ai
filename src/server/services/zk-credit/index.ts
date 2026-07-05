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
    stellarTxHash = `demo-${farmerId}-${Date.now()}`;
    explorerUrl = undefined;
  }

  const credential = await buildCredentialFromWitness(witness, {
    mode,
    stellarTxHash,
    explorerUrl,
  });

  await saveFarmerCredential(farmerId, credential);
  return credential;
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
  const credential = await getFarmerCredential(farmerId);
  if (!credential) throw new Error("No credential issued for this farmer.");

  const drawAmount = Math.min(amount ?? credential.maxUsdc, credential.maxUsdc);
  if (drawAmount <= 0) throw new Error("Credential tier does not allow drawdown.");

  if (serverEnv.zkMode() === "live" && credential.mode === "live") {
    const tx = await submitDrawdownToStellar(credential.farmerCommitment, drawAmount);
    return { amount: drawAmount, txHash: tx.txHash, explorerUrl: tx.explorerUrl, mode: "live" };
  }

  return {
    amount: drawAmount,
    txHash: `demo-drawdown-${farmerId}-${Date.now()}`,
    explorerUrl: stellarExplorerTxUrl(`demo-drawdown-${farmerId}`),
    mode: "demo",
  };
}
