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

function bigIntToBytes48(n: string): Buffer {
  const hex = BigInt(n).toString(16).padStart(96, "0");
  return Buffer.from(hex.slice(0, 96), "hex");
}

function bigIntToBytes32(n: string): Buffer {
  const hex = BigInt(n).toString(16).padStart(64, "0");
  return Buffer.from(hex.slice(0, 64), "hex");
}

function buildG1Point(p: string[]): xdr.ScVal {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("x"), val: xdr.ScVal.scvBytes(bigIntToBytes48(p[0]!)) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("y"), val: xdr.ScVal.scvBytes(bigIntToBytes48(p[1]!)) }),
  ]);
}

function buildG2Point(p: string[][]): xdr.ScVal {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("x1"), val: xdr.ScVal.scvBytes(bigIntToBytes48(p[0]![0]!)) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("x2"), val: xdr.ScVal.scvBytes(bigIntToBytes48(p[0]![1]!)) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("y1"), val: xdr.ScVal.scvBytes(bigIntToBytes48(p[1]![0]!)) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("y2"), val: xdr.ScVal.scvBytes(bigIntToBytes48(p[1]![1]!)) }),
  ]);
}

function proofHash(proof: any): Buffer {
  // Stable canonicalization of proof object for hashing
  const canonical = JSON.stringify(proof, Object.keys(proof && typeof proof === 'object' ? proof : {}).sort());
  return createHash("sha256").update(canonical).digest();
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
    throw new Error("Stellar live mode requires STELLAR_FUNDER_SECRET and SOROBAN_CONTRACT_ID in the environment.");
  }

  const keypair = Keypair.fromSecret(secret);
  const server = new rpc.Server(serverEnv.stellarSorobanRpcUrl());

  try {
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
            xdr.ScVal.scvMap([
              new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("a"), val: buildG1Point((proof as any).pi_a) }),
              new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("b"), val: buildG2Point((proof as any).pi_b) }),
              new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("c"), val: buildG1Point((proof as any).pi_c) }),
            ]),
            xdr.ScVal.scvVec(publicSignals.map(s => xdr.ScVal.scvBytes(bigIntToBytes32(s)))),
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
    if (!send.hash) throw new Error("Stellar transaction submission failed: no hash returned");

    const response = await pollTx(server, send.hash);
    if (response.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      throw new Error(`Stellar transaction failed with status: ${response.status}`);
    }

    return { txHash: send.hash, explorerUrl: stellarExplorerTxUrl(send.hash) };
  } catch (e: any) {
    throw new Error(`Stellar communication error: ${e.message}`);
  }
}

export async function submitDrawdownToStellar(
  farmerCommitment: string,
  amount: number,
): Promise<{ txHash: string; explorerUrl: string }> {
  const secret = serverEnv.stellarFunderSecret();
  const contractId = serverEnv.sorobanContractId();
  if (!secret || !contractId) {
    throw new Error("Stellar live mode requires STELLAR_FUNDER_SECRET and SOROBAN_CONTRACT_ID in the environment.");
  }

  const keypair = Keypair.fromSecret(secret);
  const server = new rpc.Server(serverEnv.stellarSorobanRpcUrl());

  try {
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
    if (!send.hash) throw new Error("Drawdown submission failed: no hash returned");

    return { txHash: send.hash, explorerUrl: stellarExplorerTxUrl(send.hash) };
  } catch (e: any) {
    throw new Error(`Stellar communication error during drawdown: ${e.message}`);
  }
}
