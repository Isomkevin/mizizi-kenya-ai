#!/usr/bin/env bun
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { computeRawScore, meetsThreshold, tierFromRawScore } from "../lib/scoring";
import { witnessJsonToCircuitInput, type WitnessJson } from "../lib/witness";

const INPUTS = join(import.meta.dir, "..", "inputs");

async function checkFile(name: string, expectPass: boolean) {
  const witness = JSON.parse(await readFile(join(INPUTS, name), "utf-8")) as WitnessJson;
  const rawScore = computeRawScore(witness);
  const tier = tierFromRawScore(rawScore);
  const input = await witnessJsonToCircuitInput(witness);
  const pass = meetsThreshold(rawScore, tier, witness.minScore ?? 60, witness.minTier ?? 2);

  const ok = pass === expectPass;
  console.log(
    `${name}: rawScore=${rawScore} tier=${tier} commitment=${input.farmerCommitment.slice(0, 16)}… ${ok ? "OK" : "FAIL"}`,
  );
  if (!ok) process.exitCode = 1;
}

await checkFile("f-002.witness.json", true);
await checkFile("f-003.witness.json", false);
