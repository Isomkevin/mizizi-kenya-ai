#!/usr/bin/env bun
/**
 * Dev access check — verifies you can reach the deployed credit_rails contract
 * and the funded testnet account. Run after copying .env (see DEPLOYMENT.md):
 *
 *   bun run zk:info
 *
 * Checks, in order:
 *   1. .env has STELLAR_FUNDER_SECRET + SOROBAN_CONTRACT_ID
 *   2. Funder account exists on testnet and shows its XLM balance
 *   3. Soroban RPC is reachable and the contract responds (simulated
 *      get_credential call — read-only, no fees, nothing submitted)
 */
import {
  Keypair,
  Operation,
  TransactionBuilder,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

import { env, stellarNetworkPassphrase } from "./shared";

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

async function main() {
  const secret = env("STELLAR_FUNDER_SECRET");
  const contractId = env("SOROBAN_CONTRACT_ID");
  const network = env("STELLAR_NETWORK") ?? "testnet";
  const horizonUrl = env("STELLAR_HORIZON_URL") ?? "https://horizon-testnet.stellar.org";
  const rpcUrl = env("STELLAR_SOROBAN_RPC_URL") ?? "https://soroban-testnet.stellar.org";

  if (!secret) fail("STELLAR_FUNDER_SECRET missing — copy it into .env (see contracts/credit_rails/DEPLOYMENT.md)");
  if (!contractId) fail("SOROBAN_CONTRACT_ID missing — copy it into .env (see contracts/credit_rails/DEPLOYMENT.md)");

  const keypair = Keypair.fromSecret(secret);
  console.log(`Network:     ${network}`);
  console.log(`Horizon:     ${horizonUrl}`);
  console.log(`Soroban RPC: ${rpcUrl}`);
  console.log(`Funder:      ${keypair.publicKey()}`);
  console.log(`Contract:    ${contractId}`);
  console.log(`Explorer:    https://stellar.expert/explorer/${network}/contract/${contractId}`);

  const horizonResponse = await fetch(`${horizonUrl}/accounts/${keypair.publicKey()}`);
  if (!horizonResponse.ok) {
    fail(`Funder account not found on ${network} — re-fund it: https://friendbot.stellar.org/?addr=${keypair.publicKey()}`);
  }
  const account = (await horizonResponse.json()) as {
    balances: Array<{ asset_type: string; balance: string }>;
  };
  const xlm = account.balances.find((b) => b.asset_type === "native");
  console.log(`\n✅ Funder account live — balance ${xlm?.balance ?? "?"} XLM`);

  const server = new rpc.Server(rpcUrl);
  const source = await server.getAccount(keypair.publicKey());
  const tx = new TransactionBuilder(source, {
    fee: "1000000",
    networkPassphrase: stellarNetworkPassphrase(),
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId,
        function: "get_credential",
        args: [xdr.ScVal.scvBytes(Buffer.alloc(32))],
      }),
    )
    .setTimeout(60)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    fail(`Contract call failed — is SOROBAN_CONTRACT_ID correct?\n${sim.error}`);
  }
  const result = sim.result?.retval ? scValToNative(sim.result.retval) : null;
  console.log(`✅ Contract reachable — get_credential(0x00…) returned: ${JSON.stringify(result)}`);
  console.log("\nYou have full access. Next: bun run zk:invoke-issue (needs zk/artifacts/proof.json — see zk/README.md)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
