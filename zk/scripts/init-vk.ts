#!/usr/bin/env bun
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Keypair, Operation, TransactionBuilder, rpc, xdr } from "@stellar/stellar-sdk";

const ROOT = join(import.meta.dir, "../..");
const ART = join(ROOT, "zk", "artifacts");

function bigIntToBytes48(n: string): Buffer {
  const hex = BigInt(n).toString(16).padStart(96, "0");
  return Buffer.from(hex.slice(0, 96), "hex");
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

async function main() {
  const secret = process.env.STELLAR_SECRET;
  const contractId = process.env.SOROBAN_CONTRACT_ID;
  if (!secret || !contractId) {
    throw new Error("STELLAR_SECRET and SOROBAN_CONTRACT_ID must be set");
  }

  const vkPath = join(ART, "verification_key.json");
  const vkRaw = await readFile(vkPath, "utf-8");
  const vk = JSON.parse(vkRaw);

  const icVals = vk.IC.map((p: string[]) => buildG1Point(p));

  const vkScVal = xdr.ScVal.scvMap([
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("alpha"), val: buildG1Point(vk.vk_alpha_1) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("beta"), val: buildG2Point(vk.vk_beta_2) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("delta"), val: buildG2Point(vk.vk_delta_2) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("gamma"), val: buildG2Point(vk.vk_gamma_2) }),
    new xdr.ScMapEntry({ key: xdr.ScVal.scvSymbol("ic"), val: xdr.ScVal.scvVec(icVals) }),
  ]);

  const keypair = Keypair.fromSecret(secret);
  const server = new rpc.Server("https://soroban-testnet.stellar.org");
  const account = await server.getAccount(keypair.publicKey());

  let tx = new TransactionBuilder(account, {
    fee: "10000000",
    networkPassphrase: "Test SDF Network ; September 2015",
  })
    .addOperation(
      Operation.invokeContractFunction({
        contract: contractId,
        function: "init_vk",
        args: [vkScVal],
      })
    )
    .setTimeout(180)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(keypair);
  const send = await server.sendTransaction(tx);
  console.log("Tx hash:", send.hash);

  let response = await server.getTransaction(send.hash);
  while (response.status === rpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise((r) => setTimeout(r, 1000));
    response = await server.getTransaction(send.hash);
  }

  if (response.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    console.error("Tx failed", response);
  } else {
    console.log("Verification key initialized!");
  }
}

main().catch(console.error);
