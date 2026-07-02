#!/usr/bin/env bun
/**
 * Verify proof.json locally with snarkjs.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { groth16 } from "snarkjs";

const ART = join(import.meta.dir, "..", "artifacts");

async function main() {
  const proofPath = join(ART, "proof.json");
  const vkPath = join(ART, "verification_key.json");

  const envelope = JSON.parse(await readFile(proofPath, "utf-8")) as {
    proof: unknown;
    publicSignals: string[];
    demo?: boolean;
  };

  if ((envelope.proof as { demo?: boolean })?.demo) {
    console.log("Demo proof envelope — skipping snarkjs verify (run zk:setup for real proofs).");
    console.log("Public signals:", envelope.publicSignals.join(", "));
    return;
  }

  const vk = JSON.parse(await readFile(vkPath, "utf-8"));
  const ok = await groth16.verify(vk, envelope.publicSignals, envelope.proof);
  console.log(ok ? "Proof valid" : "Proof invalid");
  process.exit(ok ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
