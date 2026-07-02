# Stellar ZK Architecture: Mizizi Credit Rails

This document outlines the Zero-Knowledge implementation for the Mizizi project, designed for the **Stellar Hacks: Real-World ZK** challenge.

## 🎯 The Problem: The Privacy-Credit Paradox
Farmers in Kenya often have strong repayment histories via mobile money (M-Pesa), but sharing raw transaction logs with lenders is a privacy violation and a security risk. Lenders need proof of creditworthiness, but farmers need privacy.

## 🛠 The ZK Solution: Privacy-Preserving Credit Tiers

Mizizi solves this by moving the credit-scoring logic into a Zero-Knowledge circuit.

### 1. The Circuit (Off-Chain)
- **Tooling**: Built using **Circom 2.0** and **Groth16**.
- **Logic**: The circuit takes private inputs (turnover, repayment rate) and public constraints (minimum thresholds).
- **Output**: A ZK proof and public signals: `farmerCommitment`, `tier`, `rawScore`.
- **Privacy**: The raw financial data never leaves the farmer's environment; only the proof is submitted.

### 2. The Stellar Integration (On-Chain)
We utilize a **Hybrid-ZK Anchor** pattern to bridge the ZK proof to the Stellar blockchain via a **Soroban smart contract**.

- **Verification**: The Mizizi BFF verifies the Groth16 proof using `snarkjs`.
- **Anchoring**: Upon successful verification, the BFF calls the `issue_credential` function on the Soroban contract.
- **Load-Bearing ZK**: The smart contract stores the `proof_hash` and the `tier`. This credential is the **mandatory requirement** for the `drawdown` function. Without a ZK-verified credential, a farmer cannot request credit on-chain.

### 3. Protocol 25/26 Alignment
Our architecture is built to evolve with Stellar's roadmap:
- **Current**: Hybrid verification (BFF $\rightarrow$ Soroban).
- **Future**: Full on-chain verification using Stellar's native **BN254 host functions** (introduced in Protocol 25/26). By using Groth16, we are perfectly positioned to migrate the verifier logic directly into the Soroban contract using the `stellar/soroban-examples` Groth16 verifier.

## 🚀 User Flow
1. **Prove**: Farmer generates a ZK proof of their credit tier locally.
2. **Anchor**: The proof is verified and anchored to a Soroban contract on Stellar Testnet.
3. **Utilize**: The farmer uses the anchored ZK identity to request a USDC drawdown, proving they are "Tier 1" without ever revealing their balance.

## 📊 Technical Stack
- **Circuit**: Circom $\rightarrow$ Groth16
- **Blockchain**: Stellar (Soroban)
- **Language**: Rust (Contract), TypeScript (BFF/UI)
- **Primitives**: BN254 (Target), Poseidon (Target)
