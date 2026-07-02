import { computeRawScore, DEFAULT_MIN_SCORE, DEFAULT_MIN_TIER, tierFromRawScore } from "./scoring";

// circomlibjs (via ffjavascript) is Node-only and cannot be bundled for
// Cloudflare Workers. Load dynamically at call time so the workerd build
// succeeds; the ZK service falls back to a demo envelope when unavailable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PoseidonFn = ((inputs: any[]) => any) & { F: { p: bigint | string; toObject: (v: any) => bigint } };
let poseidonPromise: Promise<PoseidonFn> | null = null;

async function getPoseidon(): Promise<PoseidonFn> {
  if (!poseidonPromise) {
    poseidonPromise = (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import(/* @vite-ignore */ ("circomlibjs" as string));
      return mod.buildPoseidon();
    })();
  }
  return poseidonPromise;
}

function fieldToString(value: bigint): string {
  return value.toString();
}

/** Hash phone string to field element (Poseidon input). */
export async function phoneHashField(phone: string): Promise<string> {
  const poseidon = await getPoseidon();
  const fieldModulus = BigInt(poseidon.F.p);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(phone);
  let acc = 0n;
  for (const byte of bytes) {
    acc = (acc * 256n + BigInt(byte)) % fieldModulus;
  }
  return fieldToString(acc);
}

/** Hash salt string to field element. */
export async function saltField(salt: string): Promise<string> {
  return phoneHashField(salt);
}

export async function farmerCommitment(phone: string, salt: string): Promise<string> {
  const poseidon = await getPoseidon();
  const phoneF = BigInt(await phoneHashField(phone));
  const saltF = BigInt(await saltField(salt));
  const hash = poseidon([phoneF, saltF]);
  return fieldToString(poseidon.F.toObject(hash));
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
