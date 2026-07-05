import { computeRawScore, DEFAULT_MIN_SCORE, DEFAULT_MIN_TIER, tierFromRawScore } from "./scoring";

// circomlibjs (via ffjavascript) is Node-only and cannot be bundled for
// Cloudflare Workers. Hide the specifier from static analysis so nitro/rollup
// doesn't try to include it (`No such module "_ssr/circomlibjs"`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PoseidonFn = ((inputs: any[]) => any) & { F: { p: bigint | string; toObject: (v: any) => bigint } };
let poseidonPromise: Promise<PoseidonFn> | null = null;

const nodeDynamicImport: ((s: string) => Promise<unknown>) | null =
  typeof process !== "undefined" && !!(process as { versions?: { node?: string } }).versions?.node
    ? (new Function("s", "return import(s)") as (s: string) => Promise<unknown>)
    : null;

// BN254 scalar field modulus — used as fallback modulus when circomlibjs
// isn't available (e.g. Cloudflare Workers demo runtime).
const FIELD_MODULUS =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

async function tryGetPoseidon(): Promise<PoseidonFn | null> {
  if (!nodeDynamicImport) return null;
  if (!poseidonPromise) {
    poseidonPromise = (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await nodeDynamicImport(["circomlib", "js"].join(""));
      return mod.buildPoseidon();
    })();
  }
  try {
    return await poseidonPromise;
  } catch {
    poseidonPromise = null;
    return null;
  }
}

function fieldToString(value: bigint): string {
  return value.toString();
}

function hashBytesToField(input: string, modulus: bigint): bigint {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  let acc = 0n;
  for (const byte of bytes) {
    acc = (acc * 256n + BigInt(byte)) % modulus;
  }
  return acc;
}

/** Hash phone string to field element (Poseidon input). */
export async function phoneHashField(phone: string): Promise<string> {
  const poseidon = await tryGetPoseidon();
  const modulus = poseidon ? BigInt(poseidon.F.p) : FIELD_MODULUS;
  return fieldToString(hashBytesToField(phone, modulus));
}

/** Hash salt string to field element. */
export async function saltField(salt: string): Promise<string> {
  return phoneHashField(salt);
}

export async function farmerCommitment(phone: string, salt: string): Promise<string> {
  const poseidon = await tryGetPoseidon();
  const phoneF = BigInt(await phoneHashField(phone));
  const saltF = BigInt(await saltField(salt));
  if (poseidon) {
    const hash = poseidon([phoneF, saltF]);
    return fieldToString(poseidon.F.toObject(hash));
  }
  // Deterministic non-Poseidon fallback so demo runs work on workerd.
  const mix = (phoneF * 1000003n + saltF) % FIELD_MODULUS;
  return fieldToString(hashBytesToField(`${phoneF}:${saltF}:${mix}`, FIELD_MODULUS));
}

export interface WitnessJson {
  farmerId: string;
  phone: string;
  salt: string;
  repaymentsOnTime: number[];
  monthlyInflowKes: number[];
  minScore: number;
  minTier: number;
  tier?: number;
  rawScore?: number;
}

export interface CircuitInput {
  phoneHash: string;
  salt: string;
  repaymentsOnTime: string[];
  monthlyInflowKes: string[];
  farmerCommitment: string;
  tier: string;
  rawScore: string;
  minScore: string;
  minTier: string;
}

export async function witnessJsonToCircuitInput(witness: WitnessJson): Promise<CircuitInput> {
  const rawScore = witness.rawScore ?? computeRawScore(witness);
  const tier = witness.tier ?? tierFromRawScore(rawScore);
  const minScore = witness.minScore ?? DEFAULT_MIN_SCORE;
  const minTier = witness.minTier ?? DEFAULT_MIN_TIER;
  const commitment = await farmerCommitment(witness.phone, witness.salt);

  return {
    phoneHash: await phoneHashField(witness.phone),
    salt: await saltField(witness.salt),
    repaymentsOnTime: witness.repaymentsOnTime.slice(0, 6).map(String),
    monthlyInflowKes: witness.monthlyInflowKes.slice(0, 6).map(String),
    farmerCommitment: commitment,
    tier: String(tier),
    rawScore: String(rawScore),
    minScore: String(minScore),
    minTier: String(minTier),
  };
}

export async function circuitInputToWitness(input: CircuitInput): Promise<Record<string, string>> {
  return {
    phoneHash: input.phoneHash,
    salt: input.salt,
    "repaymentsOnTime[0]": input.repaymentsOnTime[0] ?? "0",
    "repaymentsOnTime[1]": input.repaymentsOnTime[1] ?? "0",
    "repaymentsOnTime[2]": input.repaymentsOnTime[2] ?? "0",
    "repaymentsOnTime[3]": input.repaymentsOnTime[3] ?? "0",
    "repaymentsOnTime[4]": input.repaymentsOnTime[4] ?? "0",
    "repaymentsOnTime[5]": input.repaymentsOnTime[5] ?? "0",
    "monthlyInflowKes[0]": input.monthlyInflowKes[0] ?? "0",
    "monthlyInflowKes[1]": input.monthlyInflowKes[1] ?? "0",
    "monthlyInflowKes[2]": input.monthlyInflowKes[2] ?? "0",
    "monthlyInflowKes[3]": input.monthlyInflowKes[3] ?? "0",
    "monthlyInflowKes[4]": input.monthlyInflowKes[4] ?? "0",
    "monthlyInflowKes[5]": input.monthlyInflowKes[5] ?? "0",
    farmerCommitment: input.farmerCommitment,
    tier: input.tier,
    rawScore: input.rawScore,
    minScore: input.minScore,
    minTier: input.minTier,
  };
}
