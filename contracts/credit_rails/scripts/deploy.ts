#!/usr/bin/env bun
/**
 * Deploy credit_rails WASM — requires soroban contract build output.
 * See contracts/credit_rails/README.md for manual steps.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { env } from "./shared";

const WASM_PATH = join(
  import.meta.dir,
  "..",
  "target",
  "wasm32v1-none/release",
  "credit_rails.wasm",
);

async function main() {
  const secret = env("STELLAR_FUNDER_SECRET");
  if (!secret) {
    console.error("Set STELLAR_FUNDER_SECRET in .env");
    process.exit(1);
  }

  try {
    await readFile(WASM_PATH);
  } catch {
    console.error(`Build WASM first:\n  cd contracts/credit_rails && soroban contract build`);
    console.error(`Expected: ${WASM_PATH}`);
    process.exit(1);
  }

  console.log("WASM found. Deploy with Soroban CLI:");
  console.log(
    `  soroban contract deploy --wasm ${WASM_PATH} --source ${env("STELLAR_FUNDER_SECRET")?.slice(0, 6)}… --network testnet`,
  );
  console.log("Then add SOROBAN_CONTRACT_ID to .env and set ZK_MODE=live");
}

main();
