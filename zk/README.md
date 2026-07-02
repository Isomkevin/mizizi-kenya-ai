# Mizizi ZK — Credit Tier Circuit

Groth16 circuit for agricultural credit credentials. See [docs/stellar-hacks-zk-submission-plan.md](../docs/stellar-hacks-zk-submission-plan.md).

## Prerequisites

- [Circom 2.x](https://docs.circom.io/getting-started/installation/)
- [snarkjs](https://github.com/iden3/snarkjs) (`npm i -g snarkjs` or use project devDependency)
- Bun

On Windows, run `setup.sh` in **WSL2 Ubuntu**.

## Quick start

```bash
bun install
bun run zk:setup      # compile circuit + local ceremony (WSL/Linux)
bun run zk:prove -- --farmer f-002
bun run zk:verify
bun run zk:test-vectors
```

## Public signal order

| Index | Signal |
| --- | --- |
| 0 | farmerCommitment |
| 1 | tier |
| 2 | rawScore |
| 3 | minScore |
| 4 | minTier |

## Artifacts

Committed for demo (after setup):

- `artifacts/credit_tier.wasm`
- `artifacts/credit_tier_final.zkey`
- `artifacts/verification_key.json`

Intermediate ceremony files are gitignored.

## Demo witnesses

- `inputs/f-002.witness.json` — Peter Ochieng (pass)
- `inputs/f-003.witness.json` — Faith Njeri (fail threshold)

Without compiled artifacts, `prove.ts` emits a **demo envelope** with correct public signals for UI testing.
