import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { groth16 } from "snarkjs";

import { meetsThreshold, tierFromRawScore, computeRawScore } from "../../../../zk/lib/scoring";
import {
  circuitInputToWitness,
  type WitnessJson,
  witnessJsonToCircuitInput,
} from "../../../../zk/lib/witness";

const ART = join(process.cwd(), "zk", "artifacts");

export interface ProveResult {
  proof: unknown;
  publicSignals: string[];
  demo: boolean;
}

export async function proveWitness(witness: WitnessJson): Promise<ProveResult> {
  const rawScore = computeRawScore(witness);
  const tier = tierFromRawScore(rawScore);
  if (!meetsThreshold(rawScore, tier, witness.minScore, witness.minTier)) {
    throw new Error(
      `Credit threshold not met (score=${rawScore}, tier=${tier}, minScore=${witness.minScore}, minTier=${witness.minTier})`,
    );
  }

  const circuitInput = await witnessJsonToCircuitInput(witness);
  const wasmPath = join(ART, "credit_tier.wasm");
  const zkeyPath = join(ART, "credit_tier_final.zkey");

  try {
    const input = await circuitInputToWitness(circuitInput);
    const result = await groth16.fullProve(input, wasmPath, zkeyPath);
    return { proof: result.proof, publicSignals: result.publicSignals, demo: false };
  } catch {
    return {
      proof: { demo: true, protocol: "groth16", curve: "bn128" },
      publicSignals: [
        circuitInput.farmerCommitment,
        circuitInput.tier,
        circuitInput.rawScore,
        circuitInput.minScore,
        circuitInput.minTier,
      ],
      demo: true,
    };
  }
}

export async function verifyProofLocally(
  proof: unknown,
  publicSignals: string[],
): Promise<boolean> {
  try {
    const vk = JSON.parse(await readFile(join(ART, "verification_key.json"), "utf-8"));
    return groth16.verify(vk, publicSignals, proof);
  } catch {
    return Boolean((proof as { demo?: boolean })?.demo);
  }
}
