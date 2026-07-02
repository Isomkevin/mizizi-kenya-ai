# Credit Rails Soroban Contract

Stores ZK-verified credit credentials on Stellar testnet.

## Build (WSL/Linux)

```bash
cargo install --locked soroban-cli
cd contracts/credit_rails
soroban contract build
```

WASM output: `target/wasm32v1-none/release/credit_rails.wasm`

## Deploy

```bash
# From repo root — requires STELLAR_FUNDER_SECRET in .env
bun run zk:deploy
```

## Invoke

```bash
bun run zk:invoke-issue
```

## Functions

| Function | Description |
| --- | --- |
| `issue_credential` | Store credential after BFF verifies Groth16 off-chain |
| `get_credential` | Read credential by farmer commitment |
| `drawdown` | Record drawdown intent up to `max_usdc` |

## Public signal → contract args

| Signal | Arg |
| --- | --- |
| farmerCommitment | `farmer_commitment` (BytesN<32>) |
| tier | `tier` |
| rawScore | `raw_score` |
| minScore | `min_score` |
| minTier | `min_tier` |
| proof (hashed) | `proof_hash` |

## Note on Groth16

This hackathon build verifies Groth16 proofs in the Mizizi BFF via snarkjs, then anchors public outputs + `proof_hash` on Soroban. Production can embed the [Stellar Groth16 verifier](https://github.com/stellar/soroban-examples/tree/main/groth16_verifier) for fully on-chain verification.
