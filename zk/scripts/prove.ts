#!/usr/bin/env bun
/**
 * Generate Groth16 proof from witness JSON.
 * Usage: bun run zk/scripts/prove.ts [--farmer f-002] [--input path]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { groth16 } from "snarkjs";

import { meetsThreshold } from "../lib/scoring";
import { circuitInputToWitness, type WitnessJson, witnessJsonToCircuitInput } from "../lib/witness";

const ROOT = join(import.meta.dir, "..");
const ART = join(ROOT, "artifacts");
const INPUTS = join(ROOT, "inputs");

function parseArgs(): { inputPath: string; farmerId?: string } {
  const args = process.argv.slice(2);
  let inputPath = join(INPUTS, "f-002.witness.json");
  let farmerId: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--farmer" && args[i + 1]) {
      farmerId = args[i + 1];
      inputPath = join(INPUTS, `${farmerId}.witness.json`);
      i++;
    } else if (args[i] === "--input" && args[i + 1]) {
      inputPath = args[i + 1]!;
      i++;
    }
  }

  return { inputPath, farmerId };
}

async function main() {
  const { inputPath } = parseArgs();
  const wasmPath = join(ART, "credit_tier.wasm");
  const zkeyPath = join(ART, "credit_tier_final.zkey");

  const raw = await readFile(inputPath, "utf-8");
  const witness = JSON.parse(raw) as WitnessJson;

  const circuitInput = await witnessJsonToCircuitInput(witness);
  const rawScore = Number(circuitInput.rawScore);
  const tier = Number(circuitInput.tier);
  const minScore = Number(circuitInput.minScore);
  const minTier = Number(circuitInput.minTier);

  if (!meetsThreshold(rawScore, tier, minScore, minTier)) {
    console.error(
      `Witness does not meet threshold: rawScore=${rawScore}, tier=${tier}, minScore=${minScore}, minTier=${minTier}`,
    );
    process.exit(1);
  }

  let proof: unknown;
  let publicSignals: string[];

  try {
    const input = await circuitInputToWitness(circuitInput);
    const result = await groth16.fullProve(input, wasmPath, zkeyPath);
    proof = result.proof;
    publicSignals = result.publicSignals;
  } catch (error) {
    console.warn("Groth16 prove failed (missing artifacts?). Using demo proof envelope.", error);
    publicSignals = [
      circuitInput.farmerCommitment,
      circuitInput.tier,
      circuitInput.rawScore,
      circuitInput.minScore,
      circuitInput.minTier,
    ];
    proof = {
      pi_a: ["0", "0", "1"],
      pi_b: [
        ["0", "0"],
        ["0", "0"],
        ["1", "0"],
      ],
      pi_c: ["0", "0", "1"],
      protocol: "groth16",
      curve: "bn128",
      demo: true,
    };
  }

  await mkdir(ART, { recursive: true });
  const outPath = join(ART, "proof.json");
  await writeFile(
    outPath,
    JSON.stringify(
      {
        proof,
        publicSignals,
        farmerId: witness.farmerId,
        farmerCommitment: circuitInput.farmerCommitment,
        tier: Number(circuitInput.tier),
        rawScore: Number(circuitInput.rawScore),
        maxUsdc: [0, 500, 300, 150, 0][Number(circuitInput.tier)] ?? 0,
      },
      null,
      2,
    ),
    "utf-8",
  );

  console.log(`Proof written to ${outPath}`);
  console.log(`Public signals: ${publicSignals.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
