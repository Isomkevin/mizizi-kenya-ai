#!/usr/bin/env bun
/**
 * Deploy credit_rails WASM — requires soroban contract build output.
 * See contracts/credit_rails/README.md for manual steps.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { execSync } from "node:child_process";

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

  console.log("WASM found. Deploying to Stellar Testnet...");

  try {
    // We use the secret to identify the source account for the CLI
    // Note: Soroban CLI usually expects the secret in a specific format or via an identity file.
    // For this script, we assume the user has soroban-cli installed and configured.
    const cmd = `soroban contract deploy --wasm ${WASM_PATH} --source ${secret} --network testnet`;
    const output = execSync(cmd, { encoding: "utf8" });
    console.log(output);

    const contractIdMatch = output.match(/Contract ID: ([A-Z0-9_]+)/);
    if (contractIdMatch) {
      console.log(`\n✅ Successfully deployed!`);
      console.log(`Contract ID: ${contractIdMatch[1]}`);
      console.log(`\nNext step: Add SOROBAN_CONTRACT_ID=${contractIdMatch[1]} to your .env file.`);
    } else {
      console.log(`\nDeployment finished, but could not parse Contract ID from output.`);
      console.log(`Please manually extract the Contract ID from the output above.`);
    }
  } catch (e: any) {
    console.error(`\n❌ Deployment failed: ${e.message}`);
    console.error(`Ensure soroban-cli is installed and STELLAR_FUNDER_SECRET is a valid secret key.`);
    process.exit(1);
  }
}

main();
