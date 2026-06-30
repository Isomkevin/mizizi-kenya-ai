# Stellar Hacks: Real-World ZK — Submission Plan

**Project name:** Mizizi ZK Credit Rails  
**Hackathon:** [Stellar Hacks: Real-World ZK](https://dorahacks.io/hackathon/stellar-hacks-zk/detail)  
**Deadline:** 2026-07-03 17:00 (extended)  
**Last updated:** 2026-06-30

---

## One-liner (submission pitch)

> A farmer proves they meet a credit tier derived from mobile-money turnover and repayment history **without revealing raw transactions**. A Soroban contract verifies a Groth16 proof on Stellar testnet and issues a **ZK credit credential** that unlocks a USDC input-credit drawdown.

**Why this fits the hackathon:** ZK is load-bearing (the proof *is* the credit gate), Stellar moves real money (testnet USDC), and Mizizi supplies the agricultural / informal-economy narrative judges asked for.

---

## Submission deliverables (DoraHacks checklist)

| # | Requirement | Our artifact |
| --- | --- | --- |
| 1 | Public repo + README | This repo; README section **ZK Credit Rails** (see below) |
| 2 | 2–3 min demo video | Scripted walkthrough (see [Demo video script](#demo-video-script-23-min)) |
| 3 | ZK + Stellar, load-bearing | Circom circuit → Groth16 proof → Soroban `verify` on testnet |

**Honesty policy:** README states mock M-Pesa witness data, local Groth16 trusted setup, and testnet-only USDC.

---

## Proof statement (the core cryptographic claim)

We prove **one** precise statement (hackathon MVP):

```
Given private witness W and public inputs P, the prover demonstrates:

  1. farmer_commitment = Poseidon(phone_hash, salt)
  2. repayment_score = (count of on_time flags) / N  ∈  [0, 1]  (fixed N = 6)
  3. turnover_score = min(1, sum(monthly_inflows) / TURNOVER_FLOOR)
  4. raw_score = floor( repayment_score * 70 + turnover_score * 30 )   // 0–100 integer
  5. raw_score >= MIN_SCORE  AND  tier = credit_tier(raw_score) >= MIN_TIER

Public outputs (verified on-chain):
  - farmer_commitment
  - tier          (1–4)
  - max_usdc      (tier → limit lookup, contract constant table)
  - valid_until   (unix timestamp, set by contract at issue time)
```

**Not in scope for the circuit:** Neo4j GDS, climate, graph centrality, document AI. Those stay in Mizizi as **officer context only** — the lender gate is the ZK credential.

### Why this formula

- Mirrors Mizizi’s emphasis on **repayment consistency** (~35% in PRD) + **mobile money** (~10%) without porting the full `risk-engine.ts` graph/climate penalties.
- Fixed-size witness (6 booleans + 6 integers) keeps Circom compile time and constraint count manageable.
- `farmer_commitment` binds the credential to an identity without revealing phone on-chain.

### Tier mapping (public, also enforced in contract)

| Tier | Label | `raw_score` | `max_usdc` (demo) |
| --- | --- | --- | --- |
| 1 | Excellent | ≥ 80 | 500 |
| 2 | Creditworthy | 60–79 | 300 |
| 3 | Marginal | 40–59 | 150 |
| 4 | High risk | < 40 | 0 (verify succeeds but no drawdown) |

Constants for hackathon: `MIN_SCORE = 60`, `MIN_TIER = 2`, `TURNOVER_FLOOR = 120_000` (KES, scaled in circuit as integers).

---

## Demo personas (from existing seed data)

| Role | ID | Name | Story |
| --- | --- | --- | --- |
| **Pass** | `f-001` | Wanjiru Kamau | All repayments on time; high trust; issues Tier 1–2 credential |
| **Pending lender view** | `dec-f-002` | Peter Ochieng decision | Officer queue — shows “awaiting ZK credential” until proof submitted |
| **Fail (optional)** | `f-003` | Faith Njeri | High risk / late repayment — proof fails or yields Tier 4 |

Primary demo path: **Wanjiru (`/app/farmers/f-001`)** → generate proof → Soroban tx → lender sees credential on **`/app/decisions/dec-f-002`** or farmer’s Applications tab.

---

## Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│  Mizizi UI (existing TanStack Start app)                         │
│  • Farmer Financial tab → "Generate ZK credential"               │
│  • Decision workspace → "Verify credential" + Stellar explorer   │
└────────────────────────────┬─────────────────────────────────────┘
                             │ server function
┌────────────────────────────▼─────────────────────────────────────┐
│  Prover service (`zk/prover/` — Node or Bun script)              │
│  • Load witness JSON (from seed / synthetic M-Pesa)              │
│  • snarkjs Groth16 prove                                         │
│  • Return { proof, publicSignals }                               │
└────────────────────────────┬─────────────────────────────────────┘
                             │ Stellar SDK (testnet)
┌────────────────────────────▼─────────────────────────────────────┐
│  Soroban: `contracts/credit_rails/`                              │
│  • Embed / call Groth16 verifier (stellar/soroban-examples)      │
│  • `issue_credential(proof, pub_signals)` → store Credential     │
│  • `drawdown(max_usdc)` — optional testnet USDC from pool        │
└──────────────────────────────────────────────────────────────────┘
```

### New repo folders (to create during build)

```text
zk/
  circuits/credit_tier.circom    # main circuit
  inputs/witness.schema.json     # witness JSON schema
  inputs/f-001.witness.json      # Wanjiru demo witness
  scripts/setup.sh               # circom compile + snarkjs ceremony
  scripts/prove.ts               # witness → proof.json
  artifacts/                     # gitignored: zkey, wasm, vk

contracts/
  credit_rails/
    src/lib.rs                   # credential storage + verify entrypoint
    README.md                    # deploy + invoke instructions

src/server/services/zk-credit/   # BFF: build witness, invoke prover, submit tx
src/api/functions/zk-credit.ts
src/components/app/farmers/ZkCredentialPanel.tsx
src/components/app/decisions/ZkCredentialBadge.tsx
```

---

## Scope boundaries

### In scope (P0 — must ship)

- [ ] Circom circuit `credit_tier.circom` with tests / known answer vectors
- [ ] Local Groth16 setup + prover CLI working end-to-end
- [ ] Soroban contract verifying proof on **Stellar testnet**
- [ ] One Mizizi UI flow: generate → submit → show tx hash / explorer link
- [ ] Decision or farmer view shows **Verified tier + max USDC** (public outputs only)
- [ ] README **ZK Credit Rails** section + mock-data disclaimer
- [ ] 2–3 min demo video

### In scope (P1 — if P0 done early)

- [ ] Testnet USDC drawdown from deployer pool wallet (single transfer on verify)
- [ ] Second witness (`f-003`) showing failed / low tier in video
- [ ] Landing hero line mentioning ZK + Stellar (minimal copy change)

### Explicitly out of scope (do not block submission)

- Live M-Pesa / Safaricom Daraja APIs
- Masumi / Cardano payment flows (disable in demo: `MASUMI_MODE=disabled`)
- Neo4j Aura requirement (local seed / `MIZIZI_USE_LOCAL_STORE=true`)
- Full `risk-engine.ts` parity in circuit
- Climate, graph GDS, document ingestion in demo path
- Mainnet deployment, KYC/AML, licensed lending claims
- Production Groth16 trusted setup ceremony

---

## Witness JSON schema (demo)

File: `zk/inputs/f-001.witness.json`

```json
{
  "farmerId": "f-001",
  "phone": "+254700000001",
  "salt": "demo-salt-wanjiru-2026",
  "repaymentsOnTime": [1, 1, 1, 1, 1, 1],
  "monthlyInflowKes": [18000, 22000, 19500, 21000, 20500, 23000],
  "minScore": 60,
  "minTier": 2
}
```

**Synthetic M-Pesa narrative:** UI label says “Mobile money statement (simulated)”. Officer enrichment / consent UX can stay — data source is seed file, not live API.

---

## Soroban contract (minimal interface)

```rust
// Conceptual — implement in build phase

pub struct Credential {
    pub farmer_commitment: BytesN<32>,
    pub tier: u32,
    pub max_usdc: i128,
    pub valid_until: u64,
    pub issued_at: u64,
}

// verify Groth16 + store if not expired duplicate
pub fn issue_credential(env, proof: Bytes, public_signals: Vec<BytesN<32>>) -> Credential;

pub fn get_credential(env, farmer_commitment: BytesN<32>) -> Option<Credential>;

// P1: transfer from contract-held testnet USDC
pub fn drawdown(env, farmer_commitment: BytesN<32>, amount: i128);
```

**Tech stack:** Rust + Soroban SDK; adapt [groth16_verifier](https://github.com/stellar/soroban-examples/tree/main/groth16_verifier) from `stellar/soroban-examples`. Follow [Circom on Stellar](https://jamesbachini.com/circom-on-stellar/) for vk/proof encoding.

---

## Mizizi UI integration (minimal diff)

| Surface | Change |
| --- | --- |
| `FarmerFinancialTab` | Add `ZkCredentialPanel`: status (none / proving / issued), tier, explorer link |
| `/app/decisions/$decisionId` | Add `ZkCredentialBadge`: required before approve; shows public outputs |
| `src/api/functions/zk-credit.ts` | `buildWitness(farmerId)`, `proveCredential`, `submitCredentialTx` |
| Env | `STELLAR_NETWORK=testnet`, `SOROBAN_CONTRACT_ID`, `STELLAR_SECRET` (server only) |

**Demo deploy:** Lovable with `MIZIZI_USE_LOCAL_STORE=true`, `MASUMI_MODE=disabled`, no Neo4j required for video.

---

## Demo video script (2–3 min)

1. **Problem (20s):** Agricultural lenders need mobile money + repayment signal; farmers won’t share raw M-Pesa.
2. **Proof statement (20s):** Show diagram: private witness → Groth16 → public tier + commitment.
3. **Farmer flow (40s):** Open Wanjiru profile → Financial tab → Generate credential → terminal/log shows proof → Stellar explorer tx success.
4. **Lender flow (40s):** Open pending decision → credential verified Tier 2 → approve → optional USDC drawdown tx.
5. **Privacy punchline (20s):** Lender screen shows tier/limit only; expand “raw transactions” — not available by design.
6. **Stack (20s):** Circom, Groth16, BN254, Soroban Protocol 26, Mizizi ag credit context.
7. **Honesty (10s):** Simulated M-Pesa data; testnet USDC; hackathon MVP.

---

## 3-day execution schedule

### Day 1 — 2026-06-30: “Proof verifies on testnet”

| Time | Task | Done when |
| --- | --- | --- |
| AM | Install Rust, Soroban CLI, Circom, snarkjs (WSL/Linux if needed) | `soroban --version`, `circom --version` |
| AM | Clone groth16_verifier example; deploy hello-world to testnet | Explorer shows deploy tx |
| PM | Write minimal `credit_tier.circom` (6 repayments + 6 inflows) | `snarkjs groth16 prove` succeeds locally |
| PM | Wire verifier vk into contract; `issue_credential` stub | Test invoke verifies proof on testnet |

**Day 1 gate:** CLI submits proof to contract without Mizizi UI.

### Day 2 — 2026-07-01: “Mizizi talks to Stellar”

| Time | Task | Done when |
| --- | --- | --- |
| AM | `zk/scripts/prove.ts` + `f-001.witness.json` | Reproducible proof artifact |
| AM | `src/server/services/zk-credit/` + server functions | API returns proof + tx hash |
| PM | `ZkCredentialPanel` on farmer financial tab | Button triggers full flow |
| PM | `ZkCredentialBadge` on decision workspace | Officer sees tier + explorer link |

**Day 2 gate:** Click-through demo works twice in a row without manual file edits.

### Day 3 — 2026-07-02: “Ship” (+ buffer 2026-07-03)

| Time | Task | Done when |
| --- | --- | --- |
| AM | Freeze features; P1 drawdown only if stable | — |
| AM | README ZK section + `contracts/credit_rails/README.md` | Submission-ready docs |
| PM | Record demo video; upload to DoraHacks | BUIDL submitted |
| Buffer | Fix public signal ordering / explorer links | — |

---

## README sections to add (submission)

1. **ZK Credit Rails overview** — one-liner + architecture diagram
2. **Proof statement** — copy from this doc
3. **Quick start** — `zk/scripts/setup.sh`, `prove.ts`, contract deploy, env vars
4. **Demo accounts** — `f-001` Wanjiru, `dec-f-002`
5. **Mock vs real** — simulated M-Pesa, local ceremony, testnet USDC
6. **Limitations** — no mainnet, no regulatory lending claims, self-attested witness

---

## Risks and fallbacks

| Risk | Fallback |
| --- | --- |
| Circuit too slow / buggy | Drop to **repayment-only**: prove `on_time_count >= 4` of 6 |
| Soroban encoding fails | Use smallest example circuit from tutorial first; swap vk later |
| Windows toolchain pain | Use WSL2 Ubuntu for Circom + Soroban build |
| USDC drawdown slips | Credential on-chain only; “drawdown simulated” in UI |
| UI integration slips | Submit with CLI demo in video + honest README |

**Circuit cut order (if behind):** turnover → tier mapping → full score (keep repayment count proof last).

---

## What we are NOT claiming

- Real M-Pesa integration or Safaricom partnership
- Production-grade trusted setup or credential revocation federation
- Replacement for credit bureaus, KYC, or prudential lending regulation
- That Neo4j graph scores are ZK-proven (officer intelligence only)

---

## Success criteria (internal)

We consider the hackathon effort successful if:

1. A judge can watch the video and state **what private data stayed private** and **what the proof showed**.
2. Stellar testnet explorer shows a **contract invoke** that verifies a Groth16 proof.
3. Mizizi demo farmer gets a **credential** visible to a lender without raw financial rows.
4. README clearly separates mock demo from production path.

---

## References

- [Hackathon detail](https://dorahacks.io/hackathon/stellar-hacks-zk/detail)
- [Groth16 verifier examples](https://github.com/stellar/soroban-examples/tree/main/groth16_verifier)
- [Circom on Stellar (tutorial)](https://jamesbachini.com/circom-on-stellar/)
- [Circom docs](https://docs.circom.io/)
- Mizizi seed: `src/lib/seed-data.ts` (`f-001`, `f-002`, `f-003`)
- Mizizi demo env: `.lovable/demo-env.md`

---

## Next step

Start **Day 1 gate**: scaffold `zk/` + `contracts/credit_rails/`, minimal circuit, testnet verify — before any Mizizi UI work.
