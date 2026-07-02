/**
 * Integration test: agent-to-proof-to-Stellar pipeline.
 *
 * Runs against safe testnet defaults (ZK_MODE=demo unless overridden).
 * Usage: bun run tests/integration/credit-pipeline.test.ts [farmerId]
 *
 * Asserts:
 *   1. Proof generation + local verification succeed.
 *   2. Stellar submission produces a tx hash.
 *   3. Auto drawdown broadcasts a tx hash.
 *   4. Every pipeline step is recorded as an AgentEvent with success status.
 */
import { runCreditPipeline } from "@/server/services/credit-pipeline";
import { getDb } from "@/server/db/local-store";

async function main() {
  const db = await getDb();
  const farmerId = process.argv[2] ?? db.farmers[0]?.id;
  if (!farmerId) throw new Error("No farmer available for pipeline test.");

  console.log(`▶ Running credit pipeline for ${farmerId} (network=testnet, mode=${process.env.ZK_MODE ?? "demo"})`);
  const result = await runCreditPipeline({
    farmerId,
    autoDrawdown: true,
    requestedBy: "integration-test",
  });

  const failures: string[] = [];
  if (result.status !== "success") failures.push(`pipeline status = ${result.status}: ${result.error}`);
  if (!result.credential) failures.push("no credential issued");
  if (!result.drawdown?.txHash) failures.push("no drawdown tx hash");

  const requiredSteps = [
    "input-validation",
    "witness-build",
    "proof-generation",
    "proof-verification",
    "stellar-submission",
    "credential-issued",
    "drawdown-submitted",
  ];
  for (const step of requiredSteps) {
    const ev = result.events.find((e) => e.step === step);
    if (!ev) failures.push(`missing event for step ${step}`);
    else if (ev.status !== "success") failures.push(`step ${step} = ${ev.status} (${ev.error ?? ""})`);
  }

  console.log("Events:");
  for (const ev of [...result.events].reverse()) {
    console.log(`  [${ev.status}] ${ev.step} — ${ev.message}${ev.txHash ? ` tx=${ev.txHash}` : ""}`);
  }

  if (failures.length) {
    console.error("\n✖ Pipeline test failed:");
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`\n✓ Pipeline OK. Credential tier=${result.credential?.tierLabel} drawdown=${result.drawdown?.amount} USDC (${result.drawdown?.mode})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
