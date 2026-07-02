#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ZK="$ROOT/zk"
ART="$ZK/artifacts"
CIRCUIT="$ZK/circuits/credit_tier.circom"

mkdir -p "$ART"

if ! command -v circom >/dev/null 2>&1; then
  echo "circom not found. Install: https://docs.circom.io/getting-started/installation/"
  exit 1
fi

if [ ! -d "$ROOT/node_modules/circomlib" ]; then
  echo "Installing circomlib..."
  cd "$ROOT" && bun add -d circomlib
fi

echo "Compiling circuit..."
circom "$CIRCUIT" --r1cs --wasm --sym -o "$ART" -l "$ROOT/node_modules"

echo "Running Groth16 trusted setup (local, hackathon only)..."
cd "$ART"
snarkjs groth16 setup credit_tier.r1cs "$ROOT/node_modules/circomlib/circuits/powersOfTau28_hez_final_18.ptau" credit_tier_0000.zkey
echo "hackathon-local-setup" | snarkjs zkey contribute credit_tier_0000.zkey credit_tier_final.zkey --name="mizizi-local" -v
snarkjs zkey export verificationkey credit_tier_final.zkey verification_key.json

echo "Setup complete. Artifacts in $ART"
