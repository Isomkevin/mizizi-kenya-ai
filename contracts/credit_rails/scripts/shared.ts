/**
 * Shared Stellar / ZK env helpers for scripts and server.
 */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ZK_ROOT = join(import.meta.dir, "..", "..", "zk");
export const ARTIFACTS_DIR = join(ZK_ROOT, "artifacts");
export const PROOF_PATH = join(ARTIFACTS_DIR, "proof.json");

export interface ProofEnvelope {
  proof: {
    pi_a?: string[];
    pi_b?: string[][];
    pi_c?: string[];
    demo?: boolean;
  };
  publicSignals: string[];
  farmerId?: string;
  farmerCommitment?: string;
  tier?: number;
  rawScore?: number;
  maxUsdc?: number;
}

export function env(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

export function zkMode(): "live" | "demo" | "disabled" {
  const mode = env("ZK_MODE");
  if (mode === "live" || mode === "demo" || mode === "disabled") return mode;
  if (env("STELLAR_FUNDER_SECRET") && env("SOROBAN_CONTRACT_ID")) return "live";
  return "demo";
}

export function stellarNetworkPassphrase(): string {
  return env("STELLAR_NETWORK") === "public"
    ? "Public Global Stellar Network ; September 2015"
    : "Test SDF Network ; September 2015";
}

export function stellarExplorerTxUrl(txHash: string): string {
  const network = env("STELLAR_NETWORK") === "public" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
}

export function commitmentToBytesN(commitmentDecimal: string): Buffer {
  const hex = BigInt(commitmentDecimal).toString(16).padStart(64, "0");
  return Buffer.from(hex.slice(0, 64), "hex");
}

export function proofHash(proof: ProofEnvelope["proof"]): Buffer {
  const digest = createHash("sha256").update(JSON.stringify(proof)).digest();
  return digest;
}

export async function loadProofEnvelope(path = PROOF_PATH): Promise<ProofEnvelope> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as ProofEnvelope;
}
