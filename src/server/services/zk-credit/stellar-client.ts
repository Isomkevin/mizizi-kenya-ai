import { createHash } from "node:crypto";

import {
  Keypair,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";

import { serverEnv } from "@/server/env";

function commitmentToBytes(commitmentDecimal: string): Buffer {
  const hex = BigInt(commitmentDecimal).toString(16).padStart(64, "0");
  return Buffer.from(hex.slice(0, 64), "hex");
}

function proofHash(proof: unknown): Buffer {
  return createHash("sha256").update(JSON.stringify(proof)).digest();
}

export function stellarExplorerTxUrl(txHash: string): string {
  const network = serverEnv.stellarNetwork() === "public" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${network}/tx/${txHash}`;
}

async function pollTx(server: rpc.Server, hash: string) {
  let response = await server.getTransaction(hash);
  while (response.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((r) => setTimeout(r, 1000));
    response = await server.getTransaction(hash);
  }
  return response;
}

export async function submitCredentialToStellar(
  proof: unknown,
  publicSignals: string[],
): Promise<{ txHash: string; explorerUrl: string }> {
  const secret = serverEnv.stellarFunderSecret();
  const contractId = serverEnv.sorobanContractId();
  if (!secret || !contractId) {
    throw new Error("Stellar live mode requires STELLAR_FUNDER_SECRET and SOROBAN_CONTRACT_ID");
  }

  const keypair = Keypair.fromSecret(secret);
  const server = new rpc.Server(serverEnv.stellarSorobanRpcUrl());
  const account = await server.getAccount(keypair.publicKey());

  let tx = new TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: serverEnv.stellarNetworkPassphrase(),
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId,
        function: "issue_credential",
        args: [
          xdr.ScVal.scvBytes(commitmentToBytes(publicSignals[0]!)),
          nativeToScVal(Number(publicSignals[1]), { type: "u32" }),
          nativeToScVal(Number(publicSignals[2]), { type: "u32" }),
          nativeToScVal(Number(publicSignals[3]), { type: "u32" }),
          nativeToScVal(Number(publicSignals[4]), { type: "u32" }),
          xdr.ScVal.scvBytes(proofHash(proof)),
        ],
      }),
    )
    .setTimeout(180)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(keypair);
  const send = await server.sendTransaction(tx);
  if (!send.hash) throw new Error("Stellar transaction submission failed");

  const response = await pollTx(server, send.hash);
  if (response.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Stellar transaction failed: ${response.status}`);
  }

  return { txHash: send.hash, explorerUrl: stellarExplorerTxUrl(send.hash) };
}

export async function submitDrawdownToStellar(
  farmerCommitment: string,
  amount: number,
): Promise<{ txHash: string; explorerUrl: string }> {
  const secret = serverEnv.stellarFunderSecret();
  const contractId = serverEnv.sorobanContractId();
  if (!secret || !contractId) {
    throw new Error("Stellar live mode requires STELLAR_FUNDER_SECRET and SOROBAN_CONTRACT_ID");
  }

  const keypair = Keypair.fromSecret(secret);
  const server = new rpc.Server(serverEnv.stellarSorobanRpcUrl());
  const account = await server.getAccount(keypair.publicKey());

  let tx = new TransactionBuilder(account, {
    fee: "1000000",
    networkPassphrase: serverEnv.stellarNetworkPassphrase(),
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId,
        function: "drawdown",
        args: [
          xdr.ScVal.scvBytes(commitmentToBytes(farmerCommitment)),
          nativeToScVal(amount, { type: "i128" }),
        ],
      }),
    )
    .setTimeout(180)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(keypair);
  const send = await server.sendTransaction(tx);
  if (!send.hash) throw new Error("Drawdown submission failed");

  return { txHash: send.hash, explorerUrl: stellarExplorerTxUrl(send.hash) };
}
