#!/usr/bin/env bun
/** Simulate drawdown on Soroban contract (P1). */
import {
  Keypair,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";

import {
  commitmentToBytesN,
  env,
  loadProofEnvelope,
  stellarExplorerTxUrl,
  stellarNetworkPassphrase,
  zkMode,
} from "./shared";

async function main() {
  const mode = zkMode();
  const envelope = await loadProofEnvelope();
  const amount = envelope.maxUsdc ?? 300;

  if (mode === "demo") {
    console.log(
      `Demo drawdown: ${amount} USDC for commitment ${envelope.publicSignals[0]?.slice(0, 16)}…`,
    );
    return;
  }

  const secret = env("STELLAR_FUNDER_SECRET");
  const contractId = env("SOROBAN_CONTRACT_ID");
  if (!secret || !contractId) {
    console.error("Set STELLAR_FUNDER_SECRET and SOROBAN_CONTRACT_ID");
    process.exit(1);
  }

  const keypair = Keypair.fromSecret(secret);
  const server = new rpc.Server(
    env("STELLAR_SOROBAN_RPC_URL") ?? "https://soroban-testnet.stellar.org",
  );

  const account = await server.getAccount(keypair.publicKey());
  let tx = new TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: stellarNetworkPassphrase(),
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId,
        function: "drawdown",
        args: [
          xdr.ScVal.scvBytes(commitmentToBytesN(envelope.publicSignals[0]!)),
          nativeToScVal(amount, { type: "i128" }),
        ],
      }),
    )
    .setTimeout(180)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(keypair);
  const send = await server.sendTransaction(tx);
  console.log("Drawdown tx:", send.hash, stellarExplorerTxUrl(send.hash ?? ""));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
