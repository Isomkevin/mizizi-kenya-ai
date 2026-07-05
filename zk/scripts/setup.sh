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

echo "Compiling circuit with BLS12-381..."
circom "$CIRCUIT" --r1cs --wasm --sym -o "$ART" -l "$ROOT/node_modules" -p bls12381

echo "Running Groth16 trusted setup (local, hackathon only) for BLS12-381..."
cd "$ART"

if [ ! -f "pot12_final.ptau" ]; then
  echo "Generating local BLS12-381 powers of tau..."
  npx snarkjs powersoftau new bls12381 14 pot14_0000.ptau -v
  echo "hackathon-entropy" | npx snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution" -v
  npx snarkjs powersoftau prepare phase2 pot14_0001.ptau pot12_final.ptau -v
fi

npx snarkjs groth16 setup credit_tier.r1cs pot12_final.ptau credit_tier_0000.zkey
echo "hackathon-local-setup" | npx snarkjs zkey contribute credit_tier_0000.zkey credit_tier_final.zkey --name="mizizi-local" -v
npx snarkjs zkey export verificationkey credit_tier_final.zkey verification_key.json

echo "Setup complete. Artifacts in $ART"
