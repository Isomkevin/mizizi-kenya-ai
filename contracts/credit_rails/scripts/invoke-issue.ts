#!/usr/bin/env bun
/**
 * Invoke issue_credential on deployed Soroban contract using proof.json.
 */
import {
  Keypair,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

import {
  commitmentToBytesN,
  env,
  loadProofEnvelope,
  proofHash,
  stellarExplorerTxUrl,
  stellarNetworkPassphrase,
  zkMode,
} from "./shared";

async function pollTx(server: rpc.Server, hash: string) {
  let response = await server.getTransaction(hash);
  while (response.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((r) => setTimeout(r, 1000));
    response = await server.getTransaction(hash);
  }
  return response;
}

async function main() {
  const mode = zkMode();
  const envelope = await loadProofEnvelope();

  if (mode === "demo") {
    console.log("ZK_MODE=demo — simulating Soroban issue_credential");
    console.log("Commitment:", envelope.publicSignals[0]);
    console.log("Tier:", envelope.publicSignals[1]);
    console.log("Raw score:", envelope.publicSignals[2]);
    console.log("Proof hash:", proofHash(envelope.proof).toString("hex"));
    return;
  }

  const secret = env("STELLAR_FUNDER_SECRET");
  const contractId = env("SOROBAN_CONTRACT_ID");
  if (!secret || !contractId) {
    console.error("Set STELLAR_FUNDER_SECRET and SOROBAN_CONTRACT_ID for live mode");
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
        function: "issue_credential",
        args: [
          xdr.ScVal.scvBytes(commitmentToBytesN(envelope.publicSignals[0]!)),
          nativeToScVal(Number(envelope.publicSignals[1]), { type: "u32" }),
          nativeToScVal(Number(envelope.publicSignals[2]), { type: "u32" }),
          nativeToScVal(Number(envelope.publicSignals[3]), { type: "u32" }),
          nativeToScVal(Number(envelope.publicSignals[4]), { type: "u32" }),
          xdr.ScVal.scvBytes(proofHash(envelope.proof)),
        ],
      }),
    )
    .setTimeout(180)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(keypair);

  const send = await server.sendTransaction(tx);
  console.log("Submit:", send.status, send.hash);
  if (!send.hash) process.exit(1);

  const result = await pollTx(server, send.hash);
  if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    console.error("Transaction failed", result);
    process.exit(1);
  }

  console.log("Success:", stellarExplorerTxUrl(send.hash));
  if (result.returnValue) {
    console.log("Return:", scValToNative(result.returnValue));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
