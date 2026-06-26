# Mizizi — Technical Product Requirements Document

**Version:** 1.0.0  
**Date:** 2026-06-27  
**Status:** Implementation-Ready  
**Team:** LESOM Dynamics  
**Authors:** Kevin Isom, Mercy Wairimu

---

## Table of Contents

1. Executive Summary
2. Product Vision
3. Problem Statement
4. Goals and Success Metrics
5. User Personas
6. User Stories
7. Functional Requirements
8. Non-Functional Requirements
9. Complete Feature Breakdown
10. System Architecture
11. Application Architecture
12. Database Design
13. API Specification
14. Authentication & Authorization
15. User Roles & Permissions
16. Backend Services
17. Frontend Architecture
18. State Management
19. Data Flow
20. Business Logic
21. AI Components
22. Background Jobs & Queues
23. Event-Driven Architecture
24. Third-Party Integrations
25. Infrastructure & DevOps
26. CI/CD Pipeline
27. Security Architecture
28. Privacy & Compliance
29. Performance & Scalability Strategy
30. Caching Strategy
31. Monitoring, Logging & Observability
32. Error Handling
33. Analytics & Telemetry
34. Testing Strategy
35. Deployment Strategy
36. Environment Configuration
37. Configuration Management
38. Feature Flags
39. Data Migration Strategy
40. Backup & Disaster Recovery
41. Project Folder Structure
42. Technology Stack Justification
43. Sequence Diagrams
44. Architecture Diagrams
45. Complete Development Roadmap
46. MVP Scope
47. Post-MVP Roadmap
48. Risks & Mitigations
49. Technical Debt Considerations
50. Future Extensibility

---

## 1. Executive Summary

Mizizi ("roots" in Kiswahili) is a connected farmer risk-intelligence platform that sits between fragmented agricultural data and the two decisions that depend on it — lending and insurance. It ingests disparate farmer data from cooperatives, mobile money systems, input dealers, satellite sources, and peer lending circles; resolves them into a unified farmer identity graph in Neo4j; runs graph algorithms (Louvain community detection, betweenness centrality, pathfinding) to produce a risk tier; and delivers two outputs: a detailed, graph-backed decision view for loan officers at SACCOs and agri-lenders, and a short, plain-language, actionable USSD/SMS explanation for the farmer.

The system is composed of four primary components:

- **Graph Data Layer** — Neo4j Aura with GDS plugin; the system of record.
- **Scoring Engine** — Python service that orchestrates GDS algorithm runs and produces risk tiers.
- **Explanation Engine** — LLM (Featherless-hosted open-source model) used strictly as a translator of graph-derived facts into plain language (English and Kiswahili).
- **Officer Dashboard** — React web app built with Lovable scaffolding, displaying graph neighbourhoods, risk tiers, contributing factors, and officer action tools.
- **Agentic Data Collection Layer** — Python agents registered on the Masumi network that autonomously request and pay for verified data from cooperative and climate APIs, populating the graph with audit-logged, on-chain-verified records.

The MVP targets Kenyan SACCO loan officers evaluating thin-file, collateral-free smallholder farmer applications. The stack is designed to be explainable by construction — the same graph path that produces the score is the explanation — rather than a black-box model with post-hoc interpretability.

---

## 2. Product Vision

**Mission:** Make agricultural credit risk visible, verifiable, and explainable for every smallholder farmer in East Africa — regardless of whether they hold land title or formal collateral.

**Three-year vision:** Mizizi becomes the shared farmer risk-intelligence infrastructure layer across Kenya, Uganda, and Rwanda — connecting cooperative repayment data, mobile money flows, input purchase histories, and satellite risk signals into a portable, consent-driven farmer risk identity that travels with the farmer across lenders, insurers, and input-finance providers.

**Guiding principles:**

1. **Explainability by construction.** The graph path is the explanation. No post-hoc interpretability bolted on.
2. **Human authority.** The system informs decisions; officers make them. Override capability is not optional.
3. **Constrained AI.** The LLM is a translator, not a reasoner. It summarises retrieved graph facts and nothing else.
4. **Privacy-first data collection.** Farmer consent is recorded before any data source is connected. On-chain audit via Masumi provides immutable consent logs.
5. **Last-mile accessibility.** The farmer-facing output must work on a basic feature phone over USSD with a 160-character budget per message.

---

## 3. Problem Statement

Agricultural finance fails smallholder farmers because risk is hard to see, verify, and explain. Specifically:

**Hard to see:** The same farmer may exist as five disconnected, unverified records across five systems — a cooperative register, a mobile money platform, an NGO database, an input dealer spreadsheet, and a satellite aggregator. No shared identity layer connects them. Lenders default to land title and collateral, which structurally excludes women farmers who are least likely to hold formal paperwork.

**Hard to verify:** Individual farm-level data — cooperative repayment history, peer group standing, input purchase timing — is not interoperable. Loan officers reconcile it manually, which is slow and inconsistent.

**Hard to explain:** Graph-based and alternative-data scoring approaches accurate enough to use farm-level signals are inherently less interpretable than simple scorecards. Standard explainability tooling (SHAP, LIME, counterfactuals) was not designed for a 160-character USSD session. In practice, farmers receive a bare yes/no with no actionable path to improve.

**Downstream effects:**

- ~10% of Kenyan smallholder farmers access formal credit (Shambapro, 2024).
- AFRACA member institutions direct <3% of capital to smallholder farmers against a USD 240B annual financing gap.
- Farmers miss input cycles, cannot invest in climate-resilient practices, and remain exposed to shocks that better data could have priced around.

---

## 4. Goals and Success Metrics

### MVP Goals (June 27 Demo)

| Goal                | Metric                                                  | Target                           |
| ------------------- | ------------------------------------------------------- | -------------------------------- |
| Graph completeness  | Farmer nodes with ≥3 relationship types                 | 100% of seeded synthetic farmers |
| Scoring coverage    | Risk tier assigned per farmer                           | 100%                             |
| Explanation quality | Officer explanation ≤300 words, cites ≥2 graph paths    | 100%                             |
| SMS explanation     | ≤160 characters, English and Kiswahili                  | 100%                             |
| Demo reliability    | End-to-end flow completes without error in demo         | 3/3 test profiles                |
| Masumi loop         | At least one live agentic data fetch with on-chain hash | Demonstrated once                |
| Featherless         | Explanation generated via Featherless API               | Yes                              |
| Lovable             | Dashboard scaffolded and shown in Lovable workspace     | Yes                              |

### Post-MVP (3–6 months)

| Goal                     | Metric                                               | Target |
| ------------------------ | ---------------------------------------------------- | ------ |
| Pilot SACCO onboarding   | Active loan officers using dashboard                 | 5      |
| Farmer profiles in graph | Verified, consented farmer nodes                     | 1,000  |
| Approval rate delta      | Collateral-free approvals vs baseline                | +15%   |
| Decision time            | Officer time-to-decision vs manual baseline          | -60%   |
| Farmer engagement        | Farmers who received SMS and responded or re-applied | >30%   |
| Data agent uptime        | Masumi agent jobs completing successfully            | >95%   |

---

## 5. User Personas

### Persona 1 — Sarah, Loan Officer (Primary)

- **Role:** Credit analyst at Equity SACCO, Nakuru Branch
- **Age:** 32
- **Education:** Diploma in Cooperative Management
- **Device:** Laptop (Windows), occasional mobile
- **Connectivity:** Reliable broadband at branch, intermittent 4G in the field
- **Language:** English (professional), Kiswahili (daily)
- **Pain points:** Spends 2–3 hours manually reconciling farmer data per application. Defaults to denying collateral-free applications not because the farmer is uncreditworthy but because she can't justify the decision to a credit committee without documentation. Fears being held accountable for a bad loan she approved on informal evidence.
- **Goal:** Make a defensible, fast credit decision with a clear paper trail, even for thin-file farmers.
- **Success condition:** Can open a farmer profile, understand the risk tier and its reasons within 5 minutes, and either approve with an annotated justification or deny with a clear explanation she can share with the farmer.

### Persona 2 — Grace, Smallholder Farmer (End Beneficiary)

- **Role:** Maize and bean farmer, 1.8 acres, Subukia Ward, Nakuru County
- **Age:** 44
- **Education:** Primary school
- **Device:** Basic Nokia feature phone (no smartphone)
- **Connectivity:** 2G/USSD only
- **Language:** Kiswahili (primary), some English
- **Pain points:** Has been denied credit three times because she has no land title. She knows she repays on time — her cooperative chair knows it — but the formal system can't see it. When she received a denial SMS last season it said "application unsuccessful" with no further information.
- **Goal:** Understand why she was approved or denied, and what she can do differently next season.
- **Success condition:** Receives a USSD message in Kiswahili that names a specific behaviour (e.g., "repayment record in cooperative") as a positive factor, and a specific actionable improvement if denied.

### Persona 3 — James, SACCO Credit Manager (Secondary)

- **Role:** Branch credit committee head, Equity SACCO
- **Age:** 51
- **Goal:** Oversight and audit. Needs confidence that AI-assisted decisions are explainable to regulators and defensible to board members. Not a daily user; reviews edge cases and monthly reports.
- **Success condition:** Can pull a decision audit trail for any approved or denied file within 2 minutes, including the exact graph factors cited.

### Persona 4 — David, Masumi Node Operator (Technical)

- **Role:** DevOps at a partner cooperative or agri-data provider
- **Goal:** Register a Data Agent on the Masumi network and earn USDM per verified data delivery to the Mizizi graph.
- **Success condition:** Can install the Masumi agent SDK, register the agent, and see completed jobs and payments in the Masumi dashboard with no custom backend integration required from his side.

---

## 6. User Stories

### Loan Officer (Sarah)

```
US-001: As a loan officer, I can search for a farmer by name or national ID so that I can retrieve their complete risk profile without navigating multiple systems.

US-002: As a loan officer, I can view a farmer's graph neighbourhood (cooperative, peer group, input dealer, climate zone) as a visual diagram so that I understand their network context at a glance.

US-003: As a loan officer, I can see a risk tier (1–4) and the specific graph paths that produced it so that I can justify my decision to a credit committee.

US-004: As a loan officer, I can see flagged risk conditions (e.g., drought advisory zone) with context so that I can factor environmental risk into my decision.

US-005: As a loan officer, I can annotate a farmer's file with my decision rationale so that the credit committee has a complete audit trail.

US-006: As a loan officer, I can override the system's risk tier with a documented reason so that I retain final decision authority.

US-007: As a loan officer, I can view the officer-length explanation (≤300 words) of the risk score in English so that I can use it verbatim in a decision memo.

US-008: As a loan officer, I can trigger a data-enrichment request for a specific farmer that asks the Masumi agents to fetch missing data (e.g., mobile money flows) so that I can make a more complete assessment.

US-009: As a loan officer, I can see the timestamp and source of every data point in a farmer's profile so that I know how fresh the information is.

US-010: As a loan officer, I can see a comparison of the farmer's key metrics vs cooperative median so that I have peer context for the tier.
```

### Farmer (Grace)

```
US-011: As a farmer, I receive a USSD/SMS message after a credit decision is made so that I know the outcome.

US-012: As a farmer, the USSD message names the specific factor that most influenced my result (positive or negative) so that I understand what matters.

US-013: As a farmer, if my application is denied, the USSD message tells me one concrete action I can take before the next season so that I have a path to approval.

US-014: As a farmer, the message is in Kiswahili so that I can understand it without translation.

US-015: As a farmer, I can respond to the USSD prompt to confirm I received and understood the message so that there is a consent/delivery record.
```

### Credit Manager (James)

```
US-016: As a credit manager, I can view a monthly summary dashboard of all decisions made, by tier and outcome, so that I can track portfolio risk and diversity.

US-017: As a credit manager, I can pull the full decision audit trail for any individual file so that I can respond to regulatory queries.

US-018: As a credit manager, I can see which data sources contributed to each decision so that I can validate the system's data provenance.
```

### System / Agent

```
US-019: As the system, when a new farmer application is received, I automatically trigger graph scoring so that the loan officer sees an up-to-date risk tier immediately.

US-020: As the Masumi Orchestrator Agent, when the graph detects a farmer with missing node types, I autonomously dispatch specialist agents to fetch the missing data so that graph coverage improves without manual intervention.

US-021: As a Data Agent operator, I can register my agent on the Masumi network and receive USDM for each verified data delivery so that there is an economic incentive to share cooperative data.
```

---

## 7. Functional Requirements

### FR-001: Farmer Identity Resolution

**Purpose:** Merge multiple fragmented records of the same farmer across disparate data sources into a single canonical Farmer node in Neo4j.

**Inputs:** Raw records from cooperative API (name, national ID, phone, cooperative ID), mobile money proxy (phone → transaction metadata), input dealer CSV (name, phone, purchase dates).

**Process:**

1. Ingest raw records into a staging buffer (Redis queue).
2. Run deterministic matching: exact match on national ID > exact match on phone > fuzzy match on name + county.
3. If deterministic match confidence ≥0.95, merge into existing Farmer node.
4. If confidence 0.70–0.94, create `POSSIBLE_DUPLICATE` relationship and flag for officer review.
5. If confidence <0.70, create new Farmer node.
6. Log all merge decisions with confidence score and matched fields.

**Output:** Canonical Farmer node with `farmer_id` (UUID), `national_id`, `phone`, `county`, `ward`, `cooperative_id`, `created_at`, `updated_at`, `data_completeness_score` (0–1 float).

**Database:** Neo4j — `Farmer` node; `POSSIBLE_DUPLICATE` relationship.

**Validation rules:**

- `national_id` must match Kenyan format: 8 digits.
- `phone` must match E.164 format for KE (+254XXXXXXXXX).
- Name must be ≥2 characters, alphabetic + spaces only.

**Edge cases:**

- Two records with the same national ID but different names → flag as `IDENTITY_CONFLICT`, block merge, alert administrator.
- Record with phone but no national ID → create node with `id_status: PHONE_ONLY`, lower `data_completeness_score`.
- Record arrives for a farmer node with `consent_status: REVOKED` → reject ingestion, log attempt.

**Failure modes:**

- Staging queue full → return HTTP 429, retry with exponential backoff.
- Neo4j write timeout → rollback transaction, re-queue record, alert ops.

**Security:** All national IDs stored encrypted at rest (AES-256). Phone numbers hashed for matching, stored encrypted. Raw PII never logged.

**Testing:** Unit tests for each matching rule; integration test with 100-record synthetic dataset including 20 intentional duplicates; assert merge precision ≥90%, recall ≥85%.

---

### FR-002: Graph Schema Population

**Purpose:** Populate the Neo4j graph with all node types and relationships required for scoring.

**Node types:**

- `Farmer` — central identity node.
- `Cooperative` — agricultural cooperative or SACCO.
- `Loan` — individual loan record.
- `RepaymentEvent` — single repayment transaction linked to a Loan.
- `PeerGroup` — informal lending circle.
- `InputDealer` — agri-input retailer.
- `InputPurchase` — single purchase event.
- `MobileMoneyFlow` — aggregated monthly mobile money activity (not raw transactions).
- `FarmParcel` — geographic parcel linked to farmer.
- `ClimateRiskZone` — ICPAC/Open-Meteo derived risk area.
- `DataSource` — provenance node linking data to its origin agent/API.

**Relationship types with properties:**

- `(Farmer)-[:BELONGS_TO {since: date, active: bool}]->(Cooperative)`
- `(Farmer)-[:TOOK_OUT {amount: float, currency: string, season: string}]->(Loan)`
- `(Loan)-[:HAS_REPAYMENT {date: date, amount: float, on_time: bool}]->(RepaymentEvent)`
- `(Farmer)-[:MEMBER_OF {since: date, role: string}]->(PeerGroup)`
- `(Farmer)-[:LENDS_TO_PEER {amount: float, repaid: bool}]->(Farmer)`
- `(Farmer)-[:PURCHASES_FROM {frequency: int, last_purchase: date}]->(InputDealer)`
- `(Farmer)-[:HAS_PARCEL {size_acres: float, crop: string}]->(FarmParcel)`
- `(FarmParcel)-[:LOCATED_IN {distance_km: float}]->(ClimateRiskZone)`
- `(Farmer)-[:HAS_MOBILE_ACTIVITY {month: string, tx_count: int, regularity_score: float}]->(MobileMoneyFlow)`
- `(DataSource)-[:PROVIDED {fetched_at: datetime, masumi_hash: string}]->(Farmer|Cooperative|ClimateRiskZone)`

**Indexes:**

- `Farmer.farmer_id` — unique constraint.
- `Farmer.national_id` — unique constraint (nullable).
- `Farmer.phone` — unique constraint.
- `Cooperative.cooperative_id` — unique constraint.
- `FarmParcel.geohash` — index for spatial proximity queries.
- `ClimateRiskZone.zone_id` — unique constraint.
- `Loan.loan_id` — unique constraint.

**Failure modes:** If a required node type for a relationship does not exist, create a stub node with `status: PENDING_ENRICHMENT` and queue an enrichment job.

---

### FR-003: Graph Scoring Engine

**Purpose:** Run Neo4j GDS algorithms against the farmer graph to produce a risk tier and contributing factor list.

**Inputs:** `farmer_id` (UUID), `scoring_context` (season, loan_amount, crop_type).

**Algorithm pipeline (in order):**

1. **Louvain Community Detection** — run on the subgraph of `Farmer`, `Cooperative`, `PeerGroup` nodes with `BELONGS_TO`, `MEMBER_OF`, `LENDS_TO_PEER` relationships. Produces community ID and modularity score for each farmer. High modularity in a community with high repayment rates → positive signal.

2. **Betweenness Centrality** — run on same subgraph. Farmers with high centrality in high-repayment communities score positively. Isolated farmers (low centrality) score neutrally; isolated farmers in communities with poor repayment score negatively.

3. **Repayment Consistency Score** — Cypher-computed: `(on_time_repayments / total_repayments) * recency_weight`. Recency weight: repayments in last 12 months weighted 2×, 12–24 months 1.5×, older 1×.

4. **Input Purchase Regularity** — Cypher-computed: ratio of seasons with ≥1 input purchase vs total seasons since farmer's first cooperative record. Pre-season timing (purchase >30 days before planting window) adds 0.1 bonus.

5. **Climate Risk Score** — fetched from `ClimateRiskZone` node: `drought_index`, `pest_risk_index`, `flood_risk_index`. Aggregated to `climate_risk_composite` (0–1, higher = higher risk).

6. **Mobile Money Regularity** — `MobileMoneyFlow.regularity_score` averaged across last 6 months. Missing nodes → neutral score (0.5), not penalised.

**Scoring formula:**

```
raw_score = (
  repayment_consistency * 0.35 +
  centrality_normalized * 0.20 +
  community_repayment_avg * 0.15 +
  input_regularity * 0.15 +
  mobile_regularity * 0.10 +
  (1 - climate_risk_composite) * 0.05
)
```

**Tier assignment:**

- Tier 1 (Excellent): raw_score ≥ 0.80
- Tier 2 (Creditworthy): raw_score 0.60–0.79
- Tier 3 (Marginal): raw_score 0.40–0.59
- Tier 4 (High Risk): raw_score < 0.40

**Output (JSON):**

```json
{
  "farmer_id": "uuid",
  "scored_at": "ISO8601",
  "raw_score": 0.74,
  "tier": 2,
  "tier_label": "Creditworthy",
  "contributing_factors": [
    {
      "factor": "repayment_consistency",
      "value": 0.91,
      "weight": 0.35,
      "direction": "positive",
      "graph_path": "Farmer-[:REPAYS]->Loan[3 seasons]->Cooperative[Subukia Cereals]",
      "narrative_key": "REPAYMENT_HIGH"
    }
  ],
  "flags": ["CLIMATE_MODERATE_DROUGHT"],
  "data_completeness": 0.78,
  "scoring_version": "1.2.0"
}
```

**Edge cases:**

- Farmer with zero repayment history → `data_completeness` low, scoring uses only available dimensions, flags `INSUFFICIENT_DATA`.
- All peer group members have no repayment records → community signal excluded, weight redistributed proportionally to remaining factors.
- GDS projection fails (empty subgraph) → fall back to Cypher-only scoring, log `GDS_FALLBACK`.

**Bias mitigation:** After scoring, run demographic parity check: if female farmers in the same cooperative score systematically lower than male farmers with equivalent repayment records, flag `POTENTIAL_BIAS_DETECTED` and route to manual review queue. Log for monthly audit.

**Failure modes:** GDS timeout (>30s) → return cached score with `cache_warning: true`. Neo4j unavailable → return HTTP 503, do not surface a tier to the officer until scoring completes.

**Testing:** Unit test each algorithm component with known graphs (3 test graphs: star topology, dense community, isolated node). Integration test: end-to-end scoring of 50 synthetic farmers, assert tier distribution is not degenerate (no single tier >70% of population).

---

### FR-004: Explanation Engine

**Purpose:** Translate graph scoring output into two natural language explanations: officer-length (≤300 words) and farmer-length (≤160 characters), in English and Kiswahili.

**Inputs:**

- Scoring output JSON from FR-003.
- Farmer profile metadata (name, cooperative, season, loan amount).
- Target audience: `OFFICER` or `FARMER`.
- Target language: `EN` or `SW`.

**LLM call structure:**

System prompt (fixed, not user-editable):

```
You are a factual translator for an agricultural credit scoring system. You will receive a structured JSON object containing graph-derived risk scoring facts about a farmer. Your task is to rewrite these facts as clear, plain-language prose in the target language.

STRICT RULES:
1. Only use facts present in the input JSON. Do not infer, invent, or add any information not in the JSON.
2. Do not express uncertainty about the graph facts. They are ground truth.
3. Do not make lending recommendations. Describe facts only.
4. Officer output: ≤300 words, cites at least 2 contributing factors with their graph path.
5. Farmer output: ≤160 characters, names the single highest-weight contributing factor and (if tier ≥3) one actionable improvement.
6. Kiswahili output must be natural, not machine-translated English.
7. Never expose the raw score, tier number, or algorithm names to the farmer output.
```

User prompt: structured JSON from scoring engine + metadata.

**Model:** Featherless API, model `mistralai/Mixtral-8x7B-Instruct-v0.1` (multilingual, strong Kiswahili performance, open weights).

**Output validation:**

- Officer output: assert word count ≤300, assert ≥2 graph path citations present.
- Farmer output: assert character count ≤160.
- Kiswahili output: run language detection (langdetect library), assert detected language = `sw` with confidence ≥0.85.
- If validation fails: retry once with adjusted prompt. If second attempt fails: return fallback template (hardcoded, graph-fact-filled string, no LLM).

**Fallback templates (Kiswahili, Tier 2):**

> `"Ombi lako limepitiwa. Rekodi yako ya kulipa katika [cooperative_name] ni nzuri. Endelea kulipa kwa wakati."`

**Failure modes:**

- Featherless API down → use fallback template, log `EXPLANATION_FALLBACK`.
- Response exceeds token limit → truncate at last complete sentence before limit.
- Language detection fails → serve English, log `LANGUAGE_DETECTION_FAILED`.

**Security:** The system prompt is server-side only, never transmitted to the frontend. The LLM response is validated before storage. No raw farmer PII is included in the LLM prompt — use anonymised references ("the applicant", not the farmer's name) in the system prompt context.

**Testing:** Golden-set evaluation: 20 scoring JSON fixtures with human-written reference explanations. Assert cosine similarity ≥0.7 between generated and reference (sentence-transformers). Assert no hallucinated facts in 20/20 cases (manual review checklist).

---

### FR-005: Officer Dashboard

**Purpose:** Web application for loan officers to view farmer risk profiles, graph neighbourhoods, contributing factors, and take action.

**Pages:**

1. **Login** — email/password + SACCO branch selection.
2. **Dashboard home** — pending applications queue, recent decisions, summary metrics.
3. **Farmer search** — search by name, national ID, phone, cooperative.
4. **Farmer profile** — full risk view (see detailed layout below).
5. **Decision log** — audit trail per farmer, filterable by date/tier/outcome.
6. **Branch analytics** — monthly summary (Credit Manager only).

**Farmer profile page components:**

- Header: farmer name, ID, application details, tier badge.
- Metric cards: repayment rate, centrality score, peer group avg, climate risk.
- Risk flags: amber/red banners for flagged conditions.
- Contributing factors: expandable cards, each showing factor name, weight direction, graph path (monospace), and narrative.
- Graph neighbourhood: SVG visualisation of farmer's immediate node connections (depth-1 traversal).
- Officer explanation: rendered markdown, ≤300 words.
- Action panel: Approve / Request More Info / Decline buttons, annotation textarea.
- Override panel: tier override dropdown + mandatory reason field.
- Data freshness: per-field timestamp showing source and age.

**State on the page:** All read from API on load, no local mutation. Officer actions (annotate, override, approve/deny) POST to backend. Page re-renders after action confirmation.

**Offline behaviour:** If network drops mid-session, display stale-data banner. Actions require connectivity; queue locally (IndexedDB) and retry on reconnect (notify officer).

---

### FR-006: USSD/SMS Explanation Delivery

**Purpose:** Deliver the farmer-facing explanation (≤160 characters) via a simulated USSD flow (prototype) or real Africa's Talking SMS gateway (production).

**Prototype implementation:** Web mockup showing a feature-phone frame with the USSD menu. Three screens: (1) application status, (2) primary factor, (3) improvement action (if applicable). Triggered manually by loan officer clicking "Send explanation to farmer."

**Production implementation:**

- Africa's Talking SMS API.
- Message sent in two parts if explanation requires it (up to 320 characters = 2 SMS).
- Farmer can reply "1" to confirm receipt, which logs `FARMER_ACKNOWLEDGED` event.
- Delivery status tracked: `SENT`, `DELIVERED`, `FAILED`, `ACKNOWLEDGED`.

**Language selection:** Default = Kiswahili. If farmer profile has `preferred_language: EN`, send English.

**Privacy:** SMS content does not include the numerical score or tier. It includes only natural language outcome and one factor. No internal system identifiers in the SMS body.

**Failure modes:**

- Africa's Talking API failure → log `SMS_SEND_FAILED`, retry 3× with 5-minute intervals, alert officer if all retries fail.
- Invalid phone number → log `SMS_INVALID_PHONE`, alert officer to verify phone.

---

### FR-007: Masumi Agentic Data Collection

**Purpose:** Autonomous agents that detect missing data nodes in the graph and fetch verified data from external APIs, paying for each delivery via Masumi on-chain escrow.

**Agent types:**

**Orchestrator Agent** (`mizizi-orchestrator`):

- Runs on schedule (every 6 hours) or on-demand (triggered by officer clicking "Enrich data").
- Queries Neo4j: `MATCH (f:Farmer) WHERE f.data_completeness_score < 0.7 RETURN f LIMIT 20`.
- For each under-complete farmer, identifies missing node types.
- Dispatches job to appropriate specialist agent via Masumi job queue.
- Registers with Masumi network: capability = `orchestration`, DID auto-assigned.

**Cooperative Data Agent** (`mizizi-coop-data`):

- Receives job: `{farmer_id, cooperative_id, seasons_requested}`.
- Calls cooperative API (REST, authenticated via OAuth2 token per cooperative).
- Validates response: checks repayment record schema, rejects malformed payloads.
- Hashes output with `create_masumi_output_hash`.
- Writes validated records to Neo4j staging queue.
- Confirms delivery on Masumi → escrow releases USDM to cooperative's agent wallet.

**Climate Data Agent** (`mizizi-climate-data`):

- Receives job: `{farm_parcel_geohash, season}`.
- Calls Open-Meteo API (free, no auth) for historical weather data.
- Calls ICPAC advisory API for drought/flood/pest risk indices.
- Aggregates into `ClimateRiskZone` node payload.
- Hashes, writes, confirms on Masumi.

**Mobile Money Agent** (`mizizi-mpesa-proxy`):

- Receives job: `{farmer_phone, consent_token}`.
- Calls M-Pesa statement API with farmer-provided consent token.
- Aggregates raw transactions into monthly `MobileMoneyFlow` nodes (never stores raw transactions).
- Hashes aggregate payload, writes, confirms on Masumi.

**On-chain audit:** Every Masumi job produces a Cardano transaction hash (`masumi_tx_hash`) stored on the `DataSource` node. Immutable audit of when and what data was collected.

**Consent gate:** No agent job is dispatched for a farmer without a `ConsentRecord` node in Neo4j with `status: ACTIVE` and a timestamp within the current season. Attempting to dispatch without consent → abort job, log `CONSENT_REQUIRED`.

---

### FR-008: Data Ingestion Pipeline

**Purpose:** Accept raw data from multiple sources and transform it into graph-ready payloads.

**Sources:**

1. Cooperative CSV upload (manual, via officer dashboard file upload).
2. Cooperative REST API (automated, via Masumi agent).
3. Open-Meteo API (automated, climate agent).
4. ICPAC advisory API (automated, climate agent).
5. Synthetic data seed (development/demo only).

**Pipeline stages:**

1. **Ingest** — receive raw payload, validate schema, reject with error if schema invalid.
2. **Normalise** — map source-specific field names to canonical schema.
3. **Enrich** — geocode addresses to geohash, resolve cooperative names to IDs.
4. **Stage** — write to Redis queue with TTL 24h.
5. **Resolve** — identity resolution (FR-001).
6. **Write** — merge into Neo4j within a transaction.
7. **Confirm** — emit `DATA_INGESTED` event, update `data_completeness_score`.

**Validation rules per source:**

- CSV: max 10MB, UTF-8, required columns present, date formats ISO8601.
- API: response must include `Content-Type: application/json`, HTTP 200.
- All: no raw MSISDN (phone numbers) in logs.

---

## 8. Non-Functional Requirements

### Performance

| Metric                              | Target                                  |
| ----------------------------------- | --------------------------------------- |
| Farmer profile page load (P95)      | <3 seconds                              |
| Scoring engine response             | <15 seconds (cold), <2 seconds (cached) |
| Explanation generation              | <10 seconds                             |
| Graph query (depth-1 neighbourhood) | <500ms                                  |
| SMS delivery initiation             | <5 seconds after officer action         |
| API endpoints (non-scoring)         | <500ms P99                              |

### Scalability

- System must support 50 concurrent officer sessions in MVP.
- Graph must support 100,000 Farmer nodes without query degradation.
- Scoring engine must support 200 scoring jobs per hour.
- Architecture must be horizontally scalable: stateless API servers behind load balancer.

### Availability

- Target uptime: 99.5% for officer dashboard (MVP).
- Scoring service: degraded-mode fallback (cached scores) if Neo4j GDS unavailable.
- SMS delivery: async with retry; dashboard availability independent of SMS gateway.

### Reliability

- All background jobs must be idempotent (safe to retry).
- All Neo4j writes within transactions; rollback on partial failure.
- Masumi agent jobs must be resumable after crash.

### Security

- All data in transit: TLS 1.3.
- All PII at rest: AES-256.
- National IDs: encrypted column-level, never in logs.
- API authentication: JWT (RS256), 1-hour expiry, refresh token rotation.
- Role-based access control enforced at API layer, not just UI.

### Accessibility

- Dashboard WCAG 2.1 AA compliant.
- All form controls keyboard-navigable.
- Graph visualisation has text-based alternative view (table of relationships).

### Browser Support

- Chrome 120+, Firefox 120+, Safari 16+.
- Mobile: Chrome for Android, Safari iOS (read-only view for field officers).

---

## 9. Complete Feature Breakdown

| Feature ID | Feature Name                                        | Priority | Complexity | Owner | MVP        |
| ---------- | --------------------------------------------------- | -------- | ---------- | ----- | ---------- |
| F-001      | Farmer identity resolution                          | P0       | High       | Kevin | Yes        |
| F-002      | Graph schema population                             | P0       | High       | Kevin | Yes        |
| F-003      | GDS scoring engine                                  | P0       | High       | Kevin | Yes        |
| F-004      | Explanation engine (officer)                        | P0       | Medium     | Kevin | Yes        |
| F-005      | Explanation engine (farmer/SMS)                     | P0       | Medium     | Kevin | Yes        |
| F-006      | Officer dashboard — farmer profile                  | P0       | High       | Mercy | Yes        |
| F-007      | Officer dashboard — graph visualisation             | P0       | Medium     | Mercy | Yes        |
| F-008      | Officer dashboard — actions (approve/deny/annotate) | P0       | Medium     | Mercy | Yes        |
| F-009      | Masumi orchestrator agent                           | P1       | High       | Kevin | Yes (demo) |
| F-010      | Masumi cooperative data agent                       | P1       | High       | Kevin | Yes (demo) |
| F-011      | Masumi climate data agent                           | P1       | Medium     | Kevin | Yes (demo) |
| F-012      | USSD/SMS mockup                                     | P0       | Low        | Mercy | Yes        |
| F-013      | Synthetic data seeder                               | P0       | Low        | Kevin | Yes        |
| F-014      | Auth — login/JWT                                    | P0       | Low        | Kevin | Yes        |
| F-015      | Role-based access control                           | P0       | Low        | Kevin | Yes        |
| F-016      | Decision audit trail                                | P1       | Medium     | Kevin | Yes        |
| F-017      | Officer tier override                               | P1       | Low        | Mercy | Yes        |
| F-018      | Data enrichment request (officer-triggered)         | P1       | Medium     | Kevin | Yes        |
| F-019      | Branch analytics dashboard                          | P2       | Medium     | Mercy | No         |
| F-020      | CSV data upload                                     | P1       | Medium     | Kevin | Yes        |
| F-021      | Consent management                                  | P1       | Medium     | Kevin | Yes        |
| F-022      | Bias detection flag                                 | P2       | High       | Kevin | No         |
| F-023      | Africa's Talking SMS integration                    | P2       | Low        | Kevin | No         |
| F-024      | Masumi mobile money agent                           | P2       | High       | Kevin | No         |
| F-025      | Insurance use case module                           | P3       | Very High  | Kevin | No         |

---

## 10. System Architecture

### Overview

Mizizi follows a service-oriented architecture with clear separation between the graph data layer, the scoring/AI service layer, the agentic data collection layer, and the presentation layer.

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                   │
│   React SPA (Lovable-scaffolded)   USSD/SMS Mockup      │
└────────────────────────┬────────────────────────────────┘
                         │ REST/JSON
┌────────────────────────▼────────────────────────────────┐
│                      API GATEWAY                         │
│              FastAPI (Python 3.12)                       │
│         Auth middleware · Rate limiting · Logging        │
└───┬──────────────────┬──────────────────┬───────────────┘
    │                  │                  │
┌───▼───┐        ┌─────▼────┐      ┌─────▼──────┐
│Scoring│        │Explanation│      │  Ingestion  │
│Service│        │  Service  │      │   Service   │
│(GDS)  │        │(Featherless│     │(ETL+Resolve)│
└───┬───┘        └─────┬────┘      └─────┬───────┘
    │                  │                  │
┌───▼──────────────────▼──────────────────▼───────────────┐
│                    NEO4J AURA                            │
│        Graph DB + GDS Plugin (System of Record)          │
└─────────────────────────────────────────────────────────┘
    │
┌───▼──────────────────────────────────────────────────────┐
│                  AGENTIC LAYER                            │
│   Masumi Orchestrator · Coop Agent · Climate Agent        │
│   (Python, registered on Masumi/Cardano Preprod)          │
└─────────────────────────────────────────────────────────┘
    │
┌───▼──────────────────────────────────────────────────────┐
│              SUPPORTING INFRASTRUCTURE                    │
│   Redis (queues/cache) · PostgreSQL (auth/audit/config)  │
│   Celery (background jobs) · Docker Compose (local)      │
│   Fly.io (production hosting)                             │
└──────────────────────────────────────────────────────────┘
```

### Key architectural decisions

**Decision 1: Neo4j as system of record, not a view.**
All risk intelligence lives in the graph. PostgreSQL holds only auth, audit, and configuration data that doesn't benefit from graph traversal. This is a deliberate coupling: if Neo4j is unavailable, the scoring system is degraded but the auth/audit system remains available.

**Decision 2: LLM as translator only.**
The explanation service receives structured JSON from the scoring engine and rewrites it into prose. It cannot query Neo4j directly. The system prompt is server-side and locked. This eliminates the hallucination risk that arises from letting the LLM reason over the graph independently.

**Decision 3: Synchronous scoring, asynchronous enrichment.**
Scoring runs synchronously on API request (with GDS cache). Data enrichment via Masumi agents runs asynchronously on a Celery queue. This decouples the officer dashboard response time from the data collection latency (which may involve Cardano transaction confirmation times).

**Decision 4: Stateless API servers.**
All API servers are stateless. Session state lives in JWT tokens (short-lived) and Redis (refresh token store). This allows horizontal scaling without sticky sessions.

---

## 11. Application Architecture

### Backend — FastAPI Application

```
mizizi-api/
├── main.py                  # App entry point, middleware registration
├── config.py                # Settings (pydantic-settings, env-driven)
├── dependencies.py          # Shared DI: db sessions, current_user
├── routers/
│   ├── auth.py              # /auth/* endpoints
│   ├── farmers.py           # /farmers/* endpoints
│   ├── scoring.py           # /scoring/* endpoints
│   ├── explanations.py      # /explanations/* endpoints
│   ├── decisions.py         # /decisions/* endpoints
│   ├── agents.py            # /agents/* endpoints (Masumi triggers)
│   └── analytics.py        # /analytics/* endpoints
├── services/
│   ├── graph_service.py     # Neo4j query orchestration
│   ├── scoring_service.py   # GDS algorithm invocation
│   ├── explanation_service.py # Featherless LLM calls
│   ├── ingestion_service.py # ETL pipeline
│   ├── identity_service.py  # Farmer identity resolution
│   ├── sms_service.py       # Africa's Talking / mockup
│   └── masumi_service.py    # Masumi agent job dispatch
├── models/
│   ├── farmer.py            # Pydantic models
│   ├── scoring.py
│   ├── explanation.py
│   └── decision.py
├── db/
│   ├── neo4j.py             # Neo4j driver singleton
│   ├── postgres.py          # SQLAlchemy async engine
│   └── redis.py             # Redis client singleton
├── tasks/
│   ├── celery_app.py        # Celery configuration
│   ├── scoring_tasks.py     # Async scoring jobs
│   ├── enrichment_tasks.py  # Masumi job dispatch tasks
│   └── sms_tasks.py         # SMS delivery tasks
└── utils/
    ├── encryption.py        # AES-256 field encryption
    ├── validation.py        # Custom validators
    └── logging.py           # Structured JSON logging
```

### Frontend — React SPA

```
mizizi-dashboard/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── routes/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FarmerSearch.tsx
│   │   ├── FarmerProfile.tsx
│   │   ├── DecisionLog.tsx
│   │   └── Analytics.tsx
│   ├── components/
│   │   ├── farmer/
│   │   │   ├── FarmerHeader.tsx
│   │   │   ├── MetricCards.tsx
│   │   │   ├── RiskFlags.tsx
│   │   │   ├── ContributingFactors.tsx
│   │   │   ├── GraphNeighbourhood.tsx
│   │   │   └── ActionPanel.tsx
│   │   ├── ui/                  # shadcn/ui components
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── TopBar.tsx
│   ├── hooks/
│   │   ├── useFarmer.ts
│   │   ├── useScoring.ts
│   │   └── useDecision.ts
│   ├── store/
│   │   └── useAppStore.ts       # Zustand store
│   ├── api/
│   │   └── client.ts            # Axios instance + interceptors
│   └── types/
│       └── index.ts             # Shared TypeScript types
```

### Agents

```
mizizi-agents/
├── orchestrator/
│   ├── main.py              # Masumi-registered orchestrator
│   ├── gap_detector.py      # Neo4j query: missing node types
│   └── job_dispatcher.py    # Masumi job creation
├── coop_data/
│   ├── main.py              # Masumi-registered agent
│   ├── coop_client.py       # Cooperative API client
│   └── validator.py         # Repayment record schema validation
├── climate_data/
│   ├── main.py
│   ├── openmeteo_client.py
│   └── icpac_client.py
└── shared/
    ├── masumi_client.py     # Masumi SDK wrapper
    ├── neo4j_writer.py      # Staging queue writer
    └── consent_checker.py   # Consent gate
```

---

## 12. Database Design

### Neo4j Graph Schema

#### Node property details

```cypher
// Farmer node
CREATE CONSTRAINT farmer_id_unique FOR (f:Farmer) REQUIRE f.farmer_id IS UNIQUE;
CREATE CONSTRAINT farmer_national_id_unique FOR (f:Farmer) REQUIRE f.national_id IS UNIQUE;
CREATE INDEX farmer_phone FOR (f:Farmer) ON (f.phone);

// farmer_id: STRING (UUID v4)
// national_id: STRING (encrypted, 8-digit Kenyan ID)
// phone: STRING (encrypted, E.164)
// phone_hash: STRING (SHA-256 of phone, for matching)
// first_name: STRING
// last_name: STRING
// county: STRING
// ward: STRING
// gender: STRING (M/F/OTHER/UNKNOWN)
// created_at: DATETIME
// updated_at: DATETIME
// data_completeness_score: FLOAT (0.0-1.0)
// consent_status: STRING (ACTIVE/REVOKED/PENDING)
// id_status: STRING (FULL/PHONE_ONLY/NAME_ONLY)

// Cooperative node
CREATE CONSTRAINT cooperative_id_unique FOR (c:Cooperative) REQUIRE c.cooperative_id IS UNIQUE;
// cooperative_id: STRING
// name: STRING
// county: STRING
// member_count: INTEGER
// avg_repayment_rate: FLOAT (updated monthly)
// api_endpoint: STRING (nullable)
// masumi_agent_did: STRING (nullable)

// Loan node
CREATE CONSTRAINT loan_id_unique FOR (l:Loan) REQUIRE l.loan_id IS UNIQUE;
// loan_id: STRING (UUID)
// amount: FLOAT
// currency: STRING (default KES)
// season: STRING (e.g., "LR2026")
// status: STRING (ACTIVE/REPAID/DEFAULTED/RESTRUCTURED)
// issued_date: DATE
// due_date: DATE

// RepaymentEvent node
// event_id: STRING (UUID)
// amount: FLOAT
// paid_date: DATE
// due_date: DATE
// on_time: BOOLEAN
// days_late: INTEGER (0 if on_time)

// PeerGroup node
// group_id: STRING (UUID)
// name: STRING
// cooperative_id: STRING
// member_count: INTEGER
// avg_repayment_rate: FLOAT
// formed_date: DATE

// FarmParcel node
// parcel_id: STRING (UUID)
// size_acres: FLOAT
// crop_primary: STRING
// crop_secondary: STRING (nullable)
// geohash: STRING (precision 7)
// latitude: FLOAT
// longitude: FLOAT

// ClimateRiskZone node
CREATE CONSTRAINT zone_id_unique FOR (z:ClimateRiskZone) REQUIRE z.zone_id IS UNIQUE;
// zone_id: STRING
// name: STRING
// drought_index: FLOAT (0-1)
// flood_risk_index: FLOAT (0-1)
// pest_risk_index: FLOAT (0-1)
// valid_from: DATE
// valid_to: DATE
// data_source: STRING

// DataSource node
// source_id: STRING (UUID)
// agent_did: STRING
// masumi_tx_hash: STRING
// fetched_at: DATETIME
// data_type: STRING
// payload_hash: STRING
```

#### Key Cypher queries

```cypher
// Depth-1 neighbourhood
MATCH (f:Farmer {farmer_id: $farmer_id})
OPTIONAL MATCH (f)-[r1]->(n1)
OPTIONAL MATCH (n1)-[r2]->(n2)
RETURN f, r1, n1, r2, n2;

// Repayment consistency score
MATCH (f:Farmer {farmer_id: $farmer_id})-[:TOOK_OUT]->(l:Loan)-[:HAS_REPAYMENT]->(r:RepaymentEvent)
WITH f,
  count(r) AS total,
  sum(CASE WHEN r.on_time THEN 1 ELSE 0 END) AS on_time
RETURN toFloat(on_time) / total AS repayment_rate;

// Community repayment average
MATCH (f:Farmer {farmer_id: $farmer_id})-[:MEMBER_OF]->(pg:PeerGroup)<-[:MEMBER_OF]-(peer:Farmer)
MATCH (peer)-[:TOOK_OUT]->(l:Loan)-[:HAS_REPAYMENT]->(r:RepaymentEvent)
WHERE peer.farmer_id <> $farmer_id
RETURN avg(CASE WHEN r.on_time THEN 1.0 ELSE 0.0 END) AS peer_avg;

// Missing node detection (Masumi orchestrator)
MATCH (f:Farmer)
WHERE NOT (f)-[:BELONGS_TO]->(:Cooperative)
   OR NOT (f)-[:HAS_PARCEL]->(:FarmParcel)
   OR f.data_completeness_score < 0.7
RETURN f.farmer_id, f.data_completeness_score
ORDER BY f.data_completeness_score ASC LIMIT 20;
```

### PostgreSQL Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('LOAN_OFFICER','CREDIT_MANAGER','ADMIN','AGENT_OPERATOR')),
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sacco_name VARCHAR(255) NOT NULL,
  county VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id VARCHAR(36) NOT NULL,
  officer_id UUID REFERENCES users(id),
  decision VARCHAR(50) NOT NULL CHECK (decision IN ('APPROVED','DECLINED','MORE_INFO_REQUESTED','PENDING')),
  tier_system INTEGER,
  tier_override INTEGER,
  override_reason TEXT,
  annotation TEXT,
  scoring_payload JSONB NOT NULL,
  explanation_officer TEXT,
  explanation_farmer_en TEXT,
  explanation_farmer_sw TEXT,
  sms_status VARCHAR(50) DEFAULT 'NOT_SENT',
  sms_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_decision_log_farmer ON decision_log(farmer_id);
CREATE INDEX idx_decision_log_officer ON decision_log(officer_id);
CREATE INDEX idx_decision_log_created ON decision_log(created_at DESC);

CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id VARCHAR(36) NOT NULL,
  data_source VARCHAR(100) NOT NULL,
  consent_given_at TIMESTAMPTZ NOT NULL,
  consent_revoked_at TIMESTAMPTZ,
  consent_method VARCHAR(50) NOT NULL CHECK (consent_method IN ('USSD','OFFICER_WITNESSED','DIGITAL_SIGNATURE')),
  season VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED'))
);

CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE masumi_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(100) NOT NULL,
  agent_did VARCHAR(255),
  farmer_id VARCHAR(36),
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING','DISPATCHED','DELIVERED','FAILED','CANCELLED')),
  masumi_tx_hash VARCHAR(255),
  usdm_amount NUMERIC(10,4),
  payload_hash VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  user_id UUID,
  farmer_id VARCHAR(36),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_analytics_event_name ON analytics_events(event_name, created_at DESC);
```

### Redis Data Structures

```
scoring:{farmer_id}:latest          STRING  JSON, TTL 1h
explanation:{farmer_id}:{audience}:{lang}:{ver}  STRING  TTL 24h
ratelimit:user:{user_id}            HASH    request count per window
ratelimit:ip:{ip}                   HASH
feature_flags                       HASH    key → "1"/"0", TTL 5m
ingestion:queue                     LIST    LPUSH/RPOP JSON payloads
coop:stats:{cooperative_id}         STRING  JSON, TTL 1h
icpac:{zone_id}:{season}            STRING  JSON, TTL 24h
```

---

## 13. API Specification

Base URL: `https://api.mizizi.io/v1`
Auth: `Authorization: Bearer {access_token}`
Content-Type: `application/json`
Error format: `{"error": {"code": "STRING", "message": "STRING", "detail": {}, "request_id": "STRING"}}`

### Authentication

```
POST /auth/login
Body:     {"email": string, "password": string, "branch_id": string}
200:      {"access_token": string, "refresh_token": string, "expires_in": 3600, "user": UserObject}
401:      INVALID_CREDENTIALS
403:      ACCOUNT_INACTIVE

POST /auth/refresh
Body:     {"refresh_token": string}
200:      {"access_token": string, "expires_in": 3600}
401:      TOKEN_EXPIRED | TOKEN_REVOKED

POST /auth/logout
Auth:     required
Body:     {"refresh_token": string}
204:      (no content)
```

### Farmers

```
GET /farmers/search?q={string}&limit={int}
Auth:     required, LOAN_OFFICER+
200:      {"results": [FarmerSummary], "total": int}

GET /farmers/{farmer_id}
Auth:     required, LOAN_OFFICER+
200:      FarmerProfile
404:      FARMER_NOT_FOUND

POST /farmers/{farmer_id}/enrich
Auth:     required, LOAN_OFFICER+
Body:     {"data_types": ["COOPERATIVE","CLIMATE","MOBILE_MONEY"]}
202:      {"job_ids": [string], "message": string}
403:      CONSENT_REQUIRED

GET /farmers/{farmer_id}/graph
Auth:     required
200:      {"nodes": [NodeObject], "edges": [EdgeObject]}

POST /farmers/upload-csv
Auth:     required, LOAN_OFFICER+
Body:     multipart/form-data, file field "data", cooperative_id field
202:      {"batch_id": string, "record_count": int}
400:      INVALID_CSV_FORMAT | CSV_TOO_LARGE
```

### Scoring

```
POST /scoring/run
Auth:     required, LOAN_OFFICER+
Body:     {"farmer_id": string, "force_refresh": bool}
200:      ScoringResult
202:      {"status": "QUEUED", "task_id": string}
503:      SCORING_UNAVAILABLE (with cached_result if available)

GET /scoring/{farmer_id}/latest
Auth:     required
200:      ScoringResult + {"cached": bool, "cached_at": datetime}
404:      NO_SCORE_AVAILABLE

GET /scoring/{task_id}/status
Auth:     required
200:      {"status": "PENDING"|"RUNNING"|"COMPLETE"|"FAILED", "result": ScoringResult|null}
```

### Decisions

```
POST /decisions
Auth:     required, LOAN_OFFICER+
Body: {
  "farmer_id": string,
  "decision": "APPROVED"|"DECLINED"|"MORE_INFO_REQUESTED",
  "tier_override": int|null,
  "override_reason": string|null,
  "annotation": string|null,
  "send_sms": bool
}
201:      DecisionRecord
422:      INVALID_OVERRIDE_REASON (if override set without reason ≥20 chars)

GET /decisions/{farmer_id}
Auth:     required, LOAN_OFFICER+
200:      [DecisionRecord]

GET /decisions?branch_id=&date_from=&date_to=&decision=&tier=&page=&limit=
Auth:     required, CREDIT_MANAGER+
200:      {"decisions": [DecisionRecord], "total": int, "page": int}
```

### Explanations

```
POST /explanations/generate
Auth:     required
Body: {
  "farmer_id": string,
  "audience": "OFFICER"|"FARMER",
  "language": "EN"|"SW",
  "force_regenerate": bool
}
200: {
  "explanation": string,
  "word_count": int,
  "char_count": int,
  "language_detected": string,
  "model": string,
  "cached": bool,
  "fallback": bool,
  "generated_at": datetime
}
```

### Agents

```
GET /agents/jobs?status=&agent_type=&date_from=&limit=
Auth:     required, ADMIN|AGENT_OPERATOR
200:      {"jobs": [MasumiJob], "total": int}

POST /agents/jobs/{job_id}/retry
Auth:     required, ADMIN
202:      {"message": "Retry queued"}

GET /agents/status
Auth:     required
200: {
  "orchestrator": {"status": string, "last_run": datetime},
  "coop_data":    {"status": string, "jobs_completed_24h": int},
  "climate_data": {"status": string, "jobs_completed_24h": int}
}
```

### Webhooks (inbound)

```
POST /webhooks/sms-delivery
Source:   Africa's Talking (verified by HMAC header)
Body:     AT delivery report payload
200:      (acknowledged)

POST /webhooks/masumi-callback
Source:   Masumi payment service (internal network only)
Body:     {"job_id": string, "status": string, "tx_hash": string}
200:      (acknowledged)
```

### Analytics

```
GET /analytics/branch?branch_id=&season=
Auth:     required, CREDIT_MANAGER+
200: {
  "total_applications": int,
  "by_tier": {"1": int, "2": int, "3": int, "4": int},
  "by_decision": {"APPROVED": int, "DECLINED": int, "MORE_INFO_REQUESTED": int},
  "avg_data_completeness": float,
  "collateral_free_approvals": int,
  "female_farmer_approvals": int,
  "override_rate": float
}
```

---

## 14. Authentication & Authorization

### JWT Configuration

- Algorithm: RS256 (asymmetric).
- Access token TTL: 3600 seconds.
- Refresh token TTL: 30 days, hash stored in PostgreSQL + Redis.
- Claims: `{sub: user_id, role: string, branch_id: string, iat: int, exp: int}`.
- Refresh rotation: old token invalidated on each use.

### Token flow

1. Client POSTs credentials → server issues access token + refresh token.
2. Access token stored in Zustand memory only (never localStorage).
3. Refresh token set as `HttpOnly; Secure; SameSite=Strict` cookie by server.
4. Axios interceptor catches 401 → auto-refresh via cookie → retry original request once.
5. On logout: server revokes refresh token in DB and Redis; client clears memory store.

### FastAPI dependency

```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(token, settings.JWT_PUBLIC_KEY, algorithms=["RS256"])
        user = await db.get(User, payload["sub"])
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="INVALID_TOKEN")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="INVALID_TOKEN")

def require_role(*roles: str):
    async def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="FORBIDDEN")
        return current_user
    return checker
```

### Password policy

- Minimum 10 characters, ≥1 uppercase, ≥1 digit, ≥1 special character.
- bcrypt hash, cost factor 12.
- Lockout: 5 failed attempts per 10 minutes per IP (Redis counter, TTL reset on success).

---

## 15. User Roles & Permissions

| Permission                | LOAN_OFFICER | CREDIT_MANAGER | ADMIN | AGENT_OPERATOR |
| ------------------------- | :----------: | :------------: | :---: | :------------: |
| Search / view farmers     |      ✓       |       ✓        |   ✓   |       —        |
| Run / view scoring        |      ✓       |       ✓        |   ✓   |       —        |
| Generate explanation      |      ✓       |       ✓        |   ✓   |       —        |
| Create decision           |      ✓       |       ✓        |   ✓   |       —        |
| Override tier             |      ✓       |       ✓        |   ✓   |       —        |
| View own-branch decisions |      ✓       |       ✓        |   ✓   |       —        |
| View all-branch decisions |      —       |       ✓        |   ✓   |       —        |
| View analytics            |      —       |       ✓        |   ✓   |       —        |
| Upload CSV                |      ✓       |       ✓        |   ✓   |       —        |
| Manage users              |      —       |       —        |   ✓   |       —        |
| View agent jobs           |      —       |       —        |   ✓   |       ✓        |
| Retry agent jobs          |      —       |       —        |   ✓   |       —        |
| Toggle feature flags      |      —       |       —        |   ✓   |       —        |

Row-level security: all decision queries filter on `branch_id` from the JWT claim. Enforced at service layer, not just UI.

---

## 16. Backend Services

### ScoringService

Orchestrates GDS algorithm runs. Checks Redis cache first. On miss: opens Neo4j session, runs algorithms in parallel async coroutines, computes composite score, assigns tier, caches result (TTL 1h), returns `ScoringResult`.

Fallback: if GDS projection fails (empty subgraph or Neo4j GDS plugin unavailable), falls back to Cypher-only scoring using repayment and input regularity dimensions only. Logs `GDS_FALLBACK` warning. Returns result with `gds_fallback: true` flag.

### ExplanationService

Receives `ScoringResult` + audience + language. Checks 24h cache. On miss: constructs user prompt (structured JSON, no PII beyond first name), calls Featherless API with locked system prompt. Validates output (word count, language detection, graph-fact keyword check). On validation failure: one retry with temperature 0.1. On second failure or API error: returns hardcoded fallback template filled with graph facts. Caches valid result (TTL 24h, keyed by `farmer_id + audience + language + scoring_version`).

### GraphService

Thin wrapper over the Neo4j async driver. All Cypher is centralised here — no raw Cypher strings in routers or other services. Manages connection pool (max 50, min 5). Converts Neo4j `Record` objects to domain Pydantic models before returning. All queries parameterised; zero string interpolation.

### IngestionService

Implements the 7-stage ETL pipeline as a Celery task chain: validate → normalise → geocode → stage → resolve identity → write to Neo4j → update completeness score. Each stage is independently retryable. Failed stages re-queue with exponential backoff (max 3 retries, delays: 30s, 120s, 600s).

### IdentityService

Deterministic merge logic. Exact match on national_id → merge immediately. Exact match on phone_hash (no national_id) → merge with `id_status: PHONE_ONLY`. Fuzzy name + county match (Levenshtein distance ≤2, same ward) with confidence 0.70–0.94 → create `POSSIBLE_DUPLICATE` relationship, flag for officer review. Below 0.70 or no match → create new Farmer node.

### MasumiService

Wraps the Masumi Python SDK. `dispatch_job(farmer_id, job_type)`: checks consent gate → creates Masumi payment request (locks USDM) → POSTs job spec to registered agent endpoint → writes `masumi_jobs` record (DISPATCHED) → returns job_id. `confirm_delivery(job_id, tx_hash)`: updates `masumi_jobs` to DELIVERED, stores tx_hash on DataSource node in Neo4j.

### SMSService

In prototype mode (`AT_SANDBOX=true`): logs the SMS content and delivery metadata, does not call Africa's Talking. In production mode: calls AT SMS API, stores delivery ID, handles delivery webhook to update `decision_log.sms_status`. Character budget enforced before send: if explanation exceeds 160 chars, truncate at last complete word before limit and append "…" (ensuring total ≤160).

---

## 17. Frontend Architecture

### Technology

- React 18 + TypeScript 5 + Vite 5
- React Router v6 (route-level code splitting via `lazy()`)
- TanStack Query v5 (server state)
- Zustand v4 (client state)
- shadcn/ui + Tailwind CSS v3
- Axios v1 (HTTP, interceptors)
- D3.js v7 (graph neighbourhood SVG)
- Lovable (scaffolding; all generated code reviewed and committed to Git)

### Routing structure

```typescript
const router = createBrowserRouter([
  { path: "/login",      element: <Login /> },
  {
    path: "/",
    element: <ProtectedLayout />,   // JWT check, redirect if no token
    children: [
      { index: true,               element: <Dashboard /> },
      { path: "farmers/search",    element: <FarmerSearch /> },
      { path: "farmers/:id",       element: lazy(() => import('./routes/FarmerProfile')) },
      { path: "decisions",         element: lazy(() => import('./routes/DecisionLog')),
        loader: requireRole('CREDIT_MANAGER') },
      { path: "analytics",         element: lazy(() => import('./routes/Analytics')),
        loader: requireRole('CREDIT_MANAGER') },
    ]
  }
]);
```

### Auth flow

1. App load → check Zustand for `accessToken` in memory.
2. No token → redirect to `/login`.
3. Login success → store `accessToken` in Zustand, `refreshToken` in HttpOnly cookie (set by server `Set-Cookie` header).
4. Axios request interceptor: attaches `Authorization: Bearer {accessToken}`.
5. Axios response interceptor: on 401 → `POST /auth/refresh` (cookie sent automatically) → update Zustand token → retry original request.
6. Refresh fails → clear Zustand, redirect to `/login`.

### Graph neighbourhood (D3)

`GraphNeighbourhood.tsx` receives `{nodes, edges}` from API. Renders SVG force-directed layout:

```typescript
// Force simulation
const simulation = d3
  .forceSimulation(nodes)
  .force(
    "link",
    d3
      .forceLink(edges)
      .id((d) => d.id)
      .distance(90),
  )
  .force("charge", d3.forceManyBody().strength(-250))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide(32));

// Node colour by type
const nodeColor: Record<string, string> = {
  Farmer: "#1D9E75",
  Cooperative: "#1D9E75",
  PeerGroup: "#7F77DD",
  InputDealer: "#7F77DD",
  ClimateRiskZone: "#EF9F27", // amber if risk flagged
  default: "#B4B2A9",
};
```

Fallback: if `nodes.length > 30`, renders a relationship table instead (accessible alternative).

### Offline handling

TanStack Query `networkMode: "offlineFirst"`. On network loss: stale data displayed with banner `"Showing cached data — reconnect to refresh"`. Write actions (decisions, annotations) stored in Zustand `pendingActions` array and persisted to IndexedDB via `idb-keyval`. On reconnect: flush pending actions in order, notify officer of sync status.

---

## 18. State Management

```typescript
// store/useAppStore.ts
interface AppStore {
  // Auth
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Active farmer context
  activeFarmerId: string | null;
  setActiveFarmer: (id: string | null) => void;

  // Offline action queue
  pendingActions: OfflineAction[];
  queueAction: (action: OfflineAction) => void;
  flushPendingActions: () => Promise<void>;
}

// TanStack Query key factory (prevents stale key collisions)
export const queryKeys = {
  farmer: (id: string) => ["farmer", id],
  scoring: (id: string) => ["scoring", id],
  decisions: (id: string) => ["decisions", id],
  graph: (id: string) => ["graph", id],
  explanation: (id: string, aud: string, lang: string) => ["explanation", id, aud, lang],
  branchLog: (params: object) => ["branch-decisions", params],
};
```

Query configuration defaults:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 30 * 60 * 1000, // 30 min
      refetchOnWindowFocus: true,
      retry: 2,
    },
    mutations: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["farmer"] });
        queryClient.invalidateQueries({ queryKey: ["decisions"] });
      },
    },
  },
});
```

---

## 19. Data Flow

### Flow 1: Farmer profile load (cache hit path)

```
Officer → /farmers/:id
React Router → FarmerProfile mounts
TanStack fires 3 parallel queries:
  GET /farmers/{id}         → Neo4j: farmer node + neighbourhood
  GET /scoring/{id}/latest  → Redis hit: ScoringResult (cached)
  GET /decisions/{id}       → PostgreSQL: DecisionRecord[]
API aggregates → FarmerProfile JSON → React renders
Total time: ~800ms
```

### Flow 2: Scoring cache miss (GDS run)

```
GET /scoring/{id}/latest
  → Redis miss
  → ScoringService.score_farmer()
    → Neo4j GDS: project subgraph
    → GDS Louvain (community detection)
    → GDS Betweenness Centrality
    → Cypher: repayment_consistency
    → Cypher: input_regularity
    → Cypher: climate_risk
    → compute composite score → assign tier
  → Redis SET (TTL 1h)
  → emit "farmer.scored" event → Celery: pre-generate explanations
  → return ScoringResult
Total time: 5–15s (GDS on small graph)
```

### Flow 3: Decision + SMS

```
Officer clicks "Approve" → POST /decisions
  → PostgreSQL INSERT decision_log
  → Celery ENQUEUE sms_tasks.send_farmer_sms(decision_log_id)
  → return 201 DecisionRecord (fast, <500ms)
[async, Celery worker]
  → fetch farmer phone (Neo4j, decrypt)
  → fetch explanation_sw (Redis hit or Featherless call)
  → AT SMS API or log (prototype)
  → UPDATE decision_log SET sms_status
[webhook, AT callback]
  → POST /webhooks/sms-delivery
  → UPDATE decision_log SET sms_status='DELIVERED'
```

### Flow 4: Masumi agentic enrichment

```
Celery beat (every 6h) → enrichment_tasks.check_graph_completeness
  → Neo4j: MATCH low-completeness farmers (limit 20)
  → For each farmer:
      → check ConsentRecord (PostgreSQL)
      → detect missing node types (Neo4j)
      → MasumiService.dispatch_job(farmer_id, "CLIMATE")
          → Masumi SDK: create_payment_request → lock USDM (Cardano Preprod)
          → POST job to ClimateDataAgent
          → INSERT masumi_jobs (DISPATCHED)
[ClimateDataAgent, async]
  → Open-Meteo API: GET weather for geohash
  → ICPAC API: GET drought index for zone
  → aggregate → ClimateRiskZone payload
  → SHA-256 hash of payload
  → Neo4j: MERGE ClimateRiskZone, link to FarmParcel
  → Masumi SDK: complete_payment(output_hash)
      → Cardano: escrow release → USDM to agent wallet
  → UPDATE masumi_jobs (DELIVERED, tx_hash)
  → store DataSource node in Neo4j (masumi_tx_hash)
[Back in API]
  → ingestion_service.update_completeness_score(farmer_id)
  → scoring_service.invalidate_cache(farmer_id)
  → if officer has active session: WebSocket push (post-MVP) / poll detects change
```

---

## 20. Business Logic

### Risk tier to lending action mapping

| Tier | Label        | Recommended action                                | Suggested product                        |
| ---- | ------------ | ------------------------------------------------- | ---------------------------------------- |
| 1    | Excellent    | Approve, standard terms                           | Standard input credit                    |
| 2    | Creditworthy | Approve, consider climate product                 | Input credit + drought-indexed insurance |
| 3    | Marginal     | Request more info; co-operative chair endorsement | Group lending product                    |
| 4    | High Risk    | Decline individual; refer to group product        | Cooperative group loan                   |

These mappings are displayed as non-binding guidance in the action panel. Final decision is the officer's.

### Data completeness score formula

```python
def compute_completeness(farmer_id: str, neo4j_session) -> float:
    has = {
        "cooperative":    bool(query_has_relationship(farmer_id, "BELONGS_TO", "Cooperative")),
        "repayment":      bool(query_has_relationship(farmer_id, "TOOK_OUT", "Loan")),
        "farm_parcel":    bool(query_has_relationship(farmer_id, "HAS_PARCEL", "FarmParcel")),
        "climate_zone":   bool(query_has_path(farmer_id, "HAS_PARCEL", "LOCATED_IN")),
        "peer_group":     bool(query_has_relationship(farmer_id, "MEMBER_OF", "PeerGroup")),
        "input_purchase": bool(query_has_relationship(farmer_id, "PURCHASES_FROM", "InputDealer")),
        "mobile_activity":bool(query_has_relationship(farmer_id, "HAS_MOBILE_ACTIVITY", "MobileMoneyFlow")),
    }
    weights = {
        "cooperative": 0.25, "repayment": 0.25, "farm_parcel": 0.15,
        "climate_zone": 0.10, "peer_group": 0.10,
        "input_purchase": 0.10, "mobile_activity": 0.05
    }
    return sum(weights[k] for k, v in has.items() if v)
```

### Tier override guardrail

- Officer selects override tier → modal appears.
- Reason field: minimum 20 characters, enforced client-side and server-side.
- Override in the "favourable" direction (e.g., Tier 4 → Tier 2) triggers a `HIGH_RISK_OVERRIDE` flag in the decision log, surfaced in monthly branch analytics for manager review.
- All overrides visible to CREDIT_MANAGER in branch decision log.

### Seasonal loan context

- Season codes: `LR{year}` (Long Rains, March–July), `SR{year}` (Short Rains, October–December).
- Current season auto-detected at scoring time based on current month.
- Input purchase regularity measured over last 3 seasons (rolling).
- Repayment recency: last 12 months weighted 2×, 12–24 months 1.5×, older 1×.
- Climate risk validity checked: zone must have `valid_to >= today`, else flag `STALE_CLIMATE_DATA`.

---

## 21. AI Components

### Featherless LLM integration

**Client setup:**

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=settings.FEATHERLESS_API_KEY,
    base_url="https://api.featherless.ai/v1",
    timeout=30.0,
)
```

**Model selection:**

- Primary: `mistralai/Mixtral-8x7B-Instruct-v0.1`
- Fallback (if primary quota exhausted): `mistralai/Mistral-7B-Instruct-v0.3`

**Generation parameters:**

- Officer explanation: `temperature=0.2, top_p=0.9, max_tokens=400`
- Farmer SMS: `temperature=0.1, top_p=0.9, max_tokens=60`
- Stop sequences: `["\n\n", "---", "Note:"]`

**Locked system prompt (server-side only, never exposed to frontend or logs):**

```
You are a factual translator for an agricultural credit risk system in East Africa.
You receive structured JSON containing graph-derived facts about a farmer's creditworthiness.
Your only task is to rewrite these facts as clear prose in the specified language and format.

STRICT RULES:
1. Use ONLY facts from the input JSON. Do not infer, assume, or add anything not present.
2. Do not express uncertainty about graph facts. They are ground truth.
3. Do not make lending recommendations. Describe facts only.
4. OFFICER format (EN): ≤300 words. Cite ≥2 graph paths using the path strings from the JSON.
5. FARMER format (SW or EN): ≤160 characters total. Name the single highest-weight positive
   factor in plain language. If tier ≥ 3, add one actionable improvement sentence.
6. Never expose the raw score, tier number, or algorithm names in FARMER output.
7. Kiswahili must be natural. Do not produce word-for-word translated English.
8. Never include markdown formatting, bullet points, or headers.
```

**Output validation pipeline:**

```python
def validate_explanation(text: str, audience: str, language: str,
                          scoring: ScoringResult) -> ValidationResult:
    checks = []
    if audience == "OFFICER":
        checks.append(len(text.split()) <= 300)
        checks.append(any(f["factor"] in text for f in scoring.contributing_factors[:2]))
    else:
        checks.append(len(text) <= 160)

    if language == "SW":
        detected = langdetect.detect(text)
        checks.append(detected == "sw")

    # Sentiment safety: blocked terms
    blocked = ["useless", "hopeless", "bure", "mtu mbaya"]
    checks.append(not any(b in text.lower() for b in blocked))

    return ValidationResult(passed=all(checks), checks=checks)
```

**Fallback template library (SW, all tiers):**

```python
FALLBACK_TEMPLATES = {
    ("FARMER", "SW", 1): "Hongera! Rekodi yako ya kulipa katika {coop_name} ni nzuri sana. Ombi lako limepita.",
    ("FARMER", "SW", 2): "Rekodi yako ya kulipa katika {coop_name} ni nzuri. Ombi lako limeidhinishwa.",
    ("FARMER", "SW", 3): "Taarifa zaidi zinahitajika. Wasiliana na ofisa wa mkopo wako katika {branch}.",
    ("FARMER", "SW", 4): "Ombi limekataliwa kwa sasa. Endelea kulipa kwa wakati katika {coop_name} kwa msimu ujao.",
    ("FARMER", "EN", 1): "Congratulations! Your repayment record at {coop_name} is excellent. Application approved.",
    ("FARMER", "EN", 2): "Your repayment record at {coop_name} is strong. Application approved.",
    ("FARMER", "EN", 3): "More information is needed. Contact your loan officer at {branch}.",
    ("FARMER", "EN", 4): "Application declined. Continue repaying on time at {coop_name} to strengthen your profile.",
}
```

### GraphRAG pattern

The graph scoring engine retrieves structured facts (paths, values, algorithm outputs) from Neo4j. These retrieved facts — not raw graph data — are passed to the LLM as the user prompt. The LLM cannot query Neo4j. It can only paraphrase what the scoring engine explicitly provides. This is a constrained retrieval-augmented generation pattern: retrieval by graph algorithm, generation strictly bounded by retrieved content.

---

## 22. Background Jobs & Queues

### Celery configuration

```python
# tasks/celery_app.py
from celery import Celery
from celery.schedules import crontab

app = Celery("mizizi", broker=settings.REDIS_URL + "/0",
             backend=settings.REDIS_URL + "/1")

app.conf.update(
    task_serializer="json",
    result_expires=3600,
    task_acks_late=True,           # Only ack after completion (reliability)
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,  # Fair dispatch across workers
    task_routes={
        "tasks.sms_tasks.*":         {"queue": "sms"},
        "tasks.enrichment_tasks.*":  {"queue": "enrichment"},
        "tasks.scoring_tasks.*":     {"queue": "scoring"},
    },
    beat_schedule={
        "check-completeness":   {"task": "tasks.enrichment_tasks.check_graph_completeness",
                                  "schedule": crontab(minute=0, hour="*/6")},
        "refresh-scores":       {"task": "tasks.scoring_tasks.refresh_stale_scores",
                                  "schedule": crontab(minute=30, hour="*/2")},
        "update-coop-stats":    {"task": "tasks.enrichment_tasks.update_cooperative_stats",
                                  "schedule": crontab(minute=0, hour=2)},
        "retry-failed-sms":     {"task": "tasks.sms_tasks.retry_failed_sms",
                                  "schedule": crontab(minute="*/15")},
    }
)
```

### Task definitions

**`scoring_tasks.refresh_stale_scores`**
Query Redis for scoring keys with TTL <600s. For each, re-queue `score_farmer`. Max 50 per run. Idempotent.

**`scoring_tasks.score_farmer(farmer_id, force=False)`**
Core scoring pipeline (calls ScoringService). Triggered on: cache miss via API, stale refresh, post-enrichment invalidation.

**`enrichment_tasks.check_graph_completeness`**
Neo4j query → low-completeness farmers → consent check → Masumi dispatch for each missing node type. Max 20 farmers per run. Writes masumi_jobs records.

**`enrichment_tasks.update_cooperative_stats`**
For each Cooperative node: recompute `avg_repayment_rate` from all linked RepaymentEvents. Update node property. Runs daily at 2am.

**`sms_tasks.send_farmer_sms(decision_log_id)`**
Fetch decision from PostgreSQL → decrypt phone → fetch SW explanation → call AT API (or log) → update `sms_status`.
Retry policy: max 3 attempts; delays 5m, 15m, 60m. After 3 failures: set `FAILED_PERMANENT`, log alert.

**`sms_tasks.retry_failed_sms`**
Query `decision_log` for `sms_status = 'FAILED'` and `sms_sent_at < NOW() - INTERVAL '15 minutes'`. Re-queue each. Max 10 per run.

---

## 23. Event-Driven Architecture

### Event catalog

| Event                    | Trigger                                  | Consumer(s)                  | Side effect                                               |
| ------------------------ | ---------------------------------------- | ---------------------------- | --------------------------------------------------------- |
| `farmer.scored`          | ScoringService completes                 | ExplanationService           | Pre-generate and cache both officer + farmer explanations |
| `farmer.enriched`        | Masumi agent confirms delivery           | ScoringService               | Invalidate scoring cache; re-score farmer                 |
| `decision.created`       | Officer POSTs decision                   | SMSService, AuditLogger      | Queue SMS send; snapshot scoring payload to PostgreSQL    |
| `sms.delivered`          | Africa's Talking webhook                 | DecisionLog                  | Update `sms_status` to DELIVERED                          |
| `sms.failed`             | AT webhook or retry exhausted            | AlertService                 | Log; notify officer via dashboard toast (next load)       |
| `farmer.consent_revoked` | Consent management                       | All caches, IngestionService | Purge PII from Redis; block future enrichment             |
| `masumi.job.delivered`   | ClimateDataAgent confirms                | IngestionService             | Write to Neo4j staging queue; update completeness         |
| `masumi.job.failed`      | Escrow timeout (Masumi)                  | OrchestratorAgent            | Retry or cancel; log alert                                |
| `identity.conflict`      | IdentityService detects dupe national_id | AdminAlertService            | Create ticket in admin queue                              |

Events implemented as Celery task dispatches in MVP. Full async event bus (Redis Streams or Kafka) is Phase 2.

---

## 24. Third-Party Integrations

### Neo4j Aura

- **Plan:** AuraDB Professional (GDS plugin required; not available on Free tier).
- **Driver:** `neo4j==5.x` Python async driver.
- **Pool:** `max_connection_pool_size=50`, `connection_timeout=10`, `max_transaction_retry_time=30`.
- **Errors handled:** `ServiceUnavailable` → retry 3×; `SessionExpired` → re-acquire session; `ConstraintError` → log, skip duplicate.
- **URI format:** `neo4j+s://xxxxx.databases.neo4j.io` (AuraDB TLS).

### Featherless AI

- **Base URL:** `https://api.featherless.ai/v1`
- **SDK:** `openai` Python package with `base_url` override.
- **Rate limit:** implement token bucket (100 req/min) in Redis if rate limit errors appear.
- **Retry:** 2× on 5xx, 0× on 4xx. No retry on timeout (30s); use fallback template.

### Masumi Network

- **SDK:** `pip install masumi` (MIT licence).
- **Network:** Cardano Preprod (testnet) for MVP; Mainnet post-MVP.
- **Local services:** `docker compose up masumi-payment masumi-registry` (from Masumi GitHub repo one-click setup).
- **Wallet funding:** Cardano testnet faucet for ADA; USDM testnet equivalent.
- **Agent registration:** `await agent.register(name="mizizi-climate-data", capabilities=["climate_risk"])` — one-time on first startup.
- **Job flow:** `create_payment_request → dispatch → confirm_delivery → escrow releases`.
- **Audit:** every job produces `masumi_tx_hash` (Cardano transaction ID) stored on `DataSource` node.

### Open-Meteo

- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Auth:** None (free tier, 10,000 req/day limit).
- **Params:** `latitude, longitude, daily=precipitation_sum,et0_fao_evapotranspiration&past_days=92`
- **Cache:** 24h TTL per geohash (Redis). No PII transmitted.
- **Drought proxy:** 30-day precipitation anomaly vs 10-year baseline.

### ICPAC

- **URL:** `https://eahazardswatch.icpac.net/api/v1/`
- **Auth:** None (public API).
- **Endpoints used:** `/droughtmonitor/`, `/floodhazard/`
- **Cache:** 24h TTL per zone_id + season.
- **Fallback:** if ICPAC returns non-200, use Open-Meteo precipitation anomaly as drought proxy. Log `ICPAC_FALLBACK`.

### Africa's Talking SMS

- **SDK:** `africastalking` Python package.
- **Auth:** `username` + `api_key` per SACCO (stored in Fly secrets).
- **Endpoint:** `https://api.africastalking.com/version1/messaging`
- **Prototype mode:** `AT_SANDBOX=true` routes to AT sandbox (no real SMS sent, delivery logs visible in AT dashboard).
- **Delivery webhooks:** AT POSTs to `POST /webhooks/sms-delivery`. Verified by `X-AT-Signature` HMAC header (shared secret in env).
- **Character limit enforcement:** truncate explanation at 160 chars before send (hard constraint, not AT-enforced).

---

## 25. Infrastructure & DevOps

### Local development stack (Docker Compose)

Full stack runs with a single `docker compose up`:

```yaml
services:
  api:
    build: ./mizizi-api
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [postgres, redis, neo4j]
    volumes: ["./mizizi-api:/app"]
    command: uvicorn main:app --reload --host 0.0.0.0

  worker:
    build: ./mizizi-api
    command: celery -A tasks.celery_app worker -Q default,sms,enrichment,scoring -c 4
    env_file: .env
    depends_on: [redis, postgres, neo4j]

  beat:
    build: ./mizizi-api
    command: celery -A tasks.celery_app beat --loglevel=info
    depends_on: [redis]

  dashboard:
    build: ./mizizi-dashboard
    ports: ["3000:3000"]
    volumes: ["./mizizi-dashboard/src:/app/src"]
    command: npm run dev

  agents:
    build: ./mizizi-agents
    env_file: .env
    depends_on: [neo4j, masumi-payment, masumi-registry]

  postgres:
    image: postgres:16-alpine
    environment: { POSTGRES_DB: mizizi, POSTGRES_USER: mizizi, POSTGRES_PASSWORD: mizizi }
    volumes: ["postgres_data:/var/lib/postgresql/data"]
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    volumes: ["redis_data:/data"]
    ports: ["6379:6379"]

  neo4j:
    image: neo4j:5.15-enterprise
    ports: ["7474:7474", "7687:7687"]
    environment:
      NEO4J_AUTH: neo4j/mizizi-secret
      NEO4J_PLUGINS: '["graph-data-science"]'
      NEO4J_ACCEPT_LICENSE_AGREEMENT: "yes"
    volumes: ["neo4j_data:/data"]

  masumi-payment:
    image: masuminetwork/payment-service:latest
    ports: ["3001:3001"]

  masumi-registry:
    image: masuminetwork/registry-service:latest
    ports: ["3000:3000"]

volumes: { postgres_data, redis_data, neo4j_data }
```

### Production hosting (Fly.io)

Primary region: `jnb` (Johannesburg — lowest latency to Kenya).

| Service   | Fly app name       | Machines         | Memory | Public?     |
| --------- | ------------------ | ---------------- | ------ | ----------- |
| API       | `mizizi-api`       | 2 (auto-scale 5) | 512MB  | Yes (HTTPS) |
| Worker    | `mizizi-worker`    | 1                | 512MB  | No          |
| Agents    | `mizizi-agents`    | 1                | 256MB  | No          |
| Dashboard | `mizizi-dashboard` | Static / Vercel  | —      | Yes (CDN)   |

All internal services communicate over Fly private WireGuard network (`.internal` DNS). Neo4j AuraDB, Featherless, Masumi, Open-Meteo, ICPAC, Africa's Talking accessed over public TLS.

---

## 26. CI/CD Pipeline

```yaml
# .github/workflows/main.yml
name: CI/CD
on:
  push:    {branches: [main, develop]}
  pull_request: {branches: [main]}

jobs:
  test-api:
    runs-on: ubuntu-latest
    services:
      postgres: {image: postgres:16, env: {POSTGRES_PASSWORD: test}, options: --health-cmd pg_isready}
      redis:    {image: redis:7-alpine}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - run: pip install -r requirements-dev.txt
      - run: pytest tests/ -v --cov --cov-fail-under=80
      - uses: codecov/codecov-action@v4

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: {node-version: "20"}
      - run: cd mizizi-dashboard && npm ci && npm test && npm run build

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install ruff mypy && ruff check . && mypy .
      - run: cd mizizi-dashboard && npm run lint

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install pip-audit && pip-audit
      - run: cd mizizi-dashboard && npm audit --audit-level=high

  deploy-staging:
    needs: [test-api, test-frontend, lint, security-scan]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --app mizizi-api-staging --remote-only
        env: {FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}}

  deploy-production:
    needs: [test-api, test-frontend, lint, security-scan]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production        # Requires manual approval in GitHub
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --app mizizi-api --remote-only
        env: {FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}}
```

**Branch strategy:**

- `main` → production. Protected. Requires PR + 1 reviewer + all CI passes + manual approval gate.
- `develop` → staging. Auto-deploys. Team integration branch.
- `feature/*` → PR into `develop`.
- `hotfix/*` → PR directly into `main` with expedited review.

---

## 27. Security Architecture

### Threat model summary

| Threat                     | Mitigation                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Unauthorized data access   | JWT RBAC + branch_id row-level filter at service layer                                |
| PII data breach (DB)       | AES-256 column encryption; national_id + phone never in logs                          |
| LLM prompt injection       | System prompt server-side; user input never in system prompt; no raw PII in LLM calls |
| SQL/Cypher injection       | SQLAlchemy ORM + parameterised Cypher (`$param` only); zero string interpolation      |
| SSRF via agents            | Strict allowlist: Open-Meteo, ICPAC, registered cooperative URLs only                 |
| Masumi escrow manipulation | Masumi SDK handles contract; app only signs job delivery hash; cannot modify escrow   |
| Brute-force login          | Redis rate limit: 5 attempts per 10min per IP; lockout with 429 response              |
| JWT theft                  | 1h access token TTL; HttpOnly refresh cookie; rotation on every refresh               |
| Supply chain               | `pip-audit` + `npm audit` in CI; pinned dependency versions in `requirements.txt`     |
| AT webhook spoofing        | HMAC signature verification on every inbound webhook                                  |

### Data classification and handling

| Data              | Class        | Storage               | Encryption                         | Logged?                    |
| ----------------- | ------------ | --------------------- | ---------------------------------- | -------------------------- |
| National ID       | Restricted   | Neo4j (node property) | AES-256                            | Never                      |
| Phone number      | Restricted   | Neo4j + PostgreSQL    | AES-256; SHA-256 hash for matching | Never                      |
| Full name         | Confidential | Neo4j                 | None                               | First name only, truncated |
| Repayment history | Confidential | Neo4j                 | None                               | Aggregates only            |
| Risk tier + score | Internal     | PostgreSQL + Redis    | None                               | Yes                        |
| SMS content       | Confidential | PostgreSQL            | Column-level                       | No                         |
| Masumi tx hashes  | Internal     | Neo4j + PostgreSQL    | None                               | Yes                        |
| API access logs   | Internal     | Log platform          | None                               | Yes (no PII fields)        |

### Network security

All internal services on Fly private network (not internet-accessible). Only the API and dashboard are public. CORS configured to whitelist dashboard origin only. Content Security Policy headers set on dashboard. HSTS enforced via Fly TLS termination.

---

## 28. Privacy & Compliance

### Kenya Data Protection Act 2019

- **Consent:** `ConsentRecord` created before any cross-source data connection. Stored in PostgreSQL (authoritative) and mirrored as a property on the Farmer node in Neo4j (for runtime gate checks). Consent is per-data-source and per-season.
- **Right to erasure:** Admin API endpoint `DELETE /admin/farmers/{id}/pii` — anonymises PII fields (replaces name, national_id, phone with hashed placeholders), retains aggregate repayment statistics (non-personal). Decision log entries retain farmer_id only (already a UUID, not a PII field).
- **Data minimisation:** Mobile money data stored as monthly aggregates only (`tx_count`, `regularity_score`). Raw transactions never stored, never passed to Masumi agents.
- **Data residency:** Fly.io Johannesburg region. Neo4j AuraDB region: `europe-west1` or closest AuraDB region to Kenya (document the selection in the deployment runbook).
- **DPA registration:** production deployment requires registration with Kenya's Office of the Data Protection Commissioner (ODPC). Not required for the hackathon prototype.

### Consent flow

1. Officer opens farmer profile, clicks "Record Consent."
2. Modal lists data sources with checkboxes (Cooperative, Mobile Money, Input Dealer).
3. Officer confirms verbal witness (`consent_method: OFFICER_WITNESSED`).
4. System creates `ConsentRecord` (PostgreSQL) + sets `consent_status: ACTIVE` on Farmer node.
5. SMS sent to farmer: consent confirmation message (Kiswahili) with revocation number.
6. Farmer replies with revocation code → `farmer.consent_revoked` event → PII purge from Redis cache; block all future enrichment for that farmer.

### Data retention schedule

| Data type         | Retention                | Purge mechanism                            |
| ----------------- | ------------------------ | ------------------------------------------ |
| Farmer PII        | Consent active + 7 years | Manual admin action; automated 7-year cron |
| Decision log      | 10 years (regulatory)    | Manual admin only                          |
| Masumi job logs   | 3 years                  | Automated nightly cron                     |
| SMS content       | 2 years                  | Automated nightly cron                     |
| Scoring snapshots | 5 years                  | Automated nightly cron                     |
| API access logs   | 90 days                  | Log platform retention policy              |
| Redis cache       | TTL-based                | Auto-expiry                                |

---

## 29. Performance & Scalability Strategy

### Neo4j GDS

- **MVP (<10k nodes):** full graph projection on each GDS run. Pre-warm named projection at API startup.
- **Production (>100k nodes):** subgraph projections per cooperative (`MATCH (f:Farmer)-[:BELONGS_TO]->(c:Cooperative {cooperative_id: $id})`). Run Louvain per cooperative community, not globally. Centrality computed on the cooperative subgraph.
- **Cache GDS results:** Louvain community IDs cached in Redis (TTL 6h per cooperative). Centrality scores cached per farmer (TTL 1h). Only re-run on new edge creation.

### API

- FastAPI fully async throughout (no blocking I/O in request handlers).
- Farmer profile: parallel `asyncio.gather()` for all Neo4j + Redis calls.
- Response compression: `GZipMiddleware` for responses >1KB.
- Pagination: all list endpoints; default 20, max 100, keyset-based (no OFFSET).

### Frontend

- Route-level code splitting (`React.lazy`).
- Bundle target: <500KB initial load.
- TanStack Query `staleTime: 5min` → reduces unnecessary re-fetches on tab switch.
- D3 force simulation: debounced resize handler; capped at 200 iterations on initial layout.
- Image assets: none in MVP (SVG icons only, no raster images).

### Horizontal scaling

- API: stateless, scale to N Fly machines behind Fly's anycast load balancer.
- Worker: scale Celery workers per queue independently (`flyctl scale count --app mizizi-worker 3`).
- Neo4j: AuraDB auto-scales read replicas on Professional plan.
- Redis: Fly Upstash; horizontal scaling transparent.

---

## 30. Caching Strategy

| Target                 | Key                                 | TTL | Invalidation                                           |
| ---------------------- | ----------------------------------- | --- | ------------------------------------------------------ |
| Scoring result         | `scoring:{farmer_id}:latest`        | 1h  | Force refresh; new data ingested; scoring version bump |
| Officer explanation    | `explanation:{id}:OFFICER:EN:{ver}` | 24h | Scoring version change                                 |
| Farmer SMS (SW)        | `explanation:{id}:FARMER:SW:{ver}`  | 24h | Scoring version change                                 |
| Farmer SMS (EN)        | `explanation:{id}:FARMER:EN:{ver}`  | 24h | Scoring version change                                 |
| Farmer profile (graph) | `profile:{farmer_id}`               | 15m | New decision or enrichment event                       |
| Feature flags          | `feature_flags`                     | 5m  | Flag updated in DB                                     |
| Louvain communities    | `gds:louvain:{cooperative_id}`      | 6h  | New Farmer node added to cooperative                   |
| Cooperative stats      | `coop:stats:{cooperative_id}`       | 1h  | `update_cooperative_stats` task                        |
| ICPAC zone data        | `icpac:{zone_id}:{season}`          | 24h | Season boundary                                        |
| Open-Meteo data        | `openmeteo:{geohash}`               | 24h | Daily refresh                                          |

All caches use cache-aside pattern. No write-through. On cache miss: compute from primary store, write to cache, return. On cache error: log warning, compute from primary store (no hard failure on cache miss).

---

## 31. Monitoring, Logging & Observability

### Logging

```python
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)
log = structlog.get_logger()

# Usage
log.info("scoring.complete",
         farmer_id=farmer_id,   # UUID, not PII
         tier=result.tier,
         raw_score=result.raw_score,
         duration_ms=elapsed,
         cached=result.cached,
         gds_fallback=result.gds_fallback)
```

PII policy: national_id, phone, name are **never** in log output. Only `farmer_id` (UUID) used in logs.

### Metrics (Prometheus via Fly)

```python
from prometheus_client import Histogram, Counter, Gauge

scoring_duration = Histogram("mizizi_scoring_duration_seconds", "GDS scoring latency", ["tier", "cached"])
explanation_duration = Histogram("mizizi_explanation_duration_seconds", "LLM explanation latency", ["audience", "language", "fallback"])
masumi_jobs = Counter("mizizi_masumi_jobs_total", "Masumi job outcomes", ["job_type", "status"])
sms_delivery = Counter("mizizi_sms_delivery_total", "SMS delivery outcomes", ["status", "language"])
api_latency = Histogram("mizizi_api_request_duration_seconds", "API endpoint latency", ["method", "endpoint", "status"])
cache_hit_ratio = Gauge("mizizi_cache_hit_ratio", "Cache hit ratio", ["cache_type"])
```

### Alerting rules

| Condition                 | Threshold                           | Channel                   |
| ------------------------- | ----------------------------------- | ------------------------- |
| API 5xx rate              | >5% over 5min                       | Slack #alerts             |
| Scoring service degraded  | No successful score in 10min        | Slack #alerts + PagerDuty |
| Neo4j connection failures | >3 in 1min                          | Slack #alerts             |
| SMS failure rate          | >20% over 1h                        | Slack #alerts             |
| Masumi job failure rate   | >50% over 6h                        | Slack #alerts             |
| Bias flag triggered       | Any `POTENTIAL_BIAS_DETECTED` event | Email admin               |
| Cache hit ratio           | <40% on scoring cache               | Slack #warnings           |

### Distributed tracing

OpenTelemetry (OTLP) with trace propagation across: FastAPI → Celery tasks → Neo4j driver. Export to Fly.io Metrics or Grafana Cloud. Trace IDs included in error responses as `request_id`.

---

## 32. Error Handling

### Error response format

```json
{
  "error": {
    "code": "SCORING_TIMEOUT",
    "message": "Scoring is taking longer than expected. A cached result has been returned.",
    "detail": { "cached": true, "cached_at": "2026-06-27T09:00:00Z", "cache_age_seconds": 1800 },
    "request_id": "req_abc123"
  }
}
```

### Complete error code reference

| Code                      | HTTP     | Description                                   |
| ------------------------- | -------- | --------------------------------------------- |
| `INVALID_CREDENTIALS`     | 401      | Wrong email or password                       |
| `TOKEN_EXPIRED`           | 401      | Access token expired                          |
| `TOKEN_REVOKED`           | 401      | Refresh token revoked                         |
| `FORBIDDEN`               | 403      | Insufficient role                             |
| `CONSENT_REQUIRED`        | 403      | No active consent for this farmer             |
| `FARMER_NOT_FOUND`        | 404      | No Farmer node with given ID                  |
| `NO_SCORE_AVAILABLE`      | 404      | Farmer never scored                           |
| `IDENTITY_CONFLICT`       | 409      | Duplicate national ID across two farmer nodes |
| `INVALID_OVERRIDE_REASON` | 422      | Override reason <20 characters                |
| `INVALID_CSV_FORMAT`      | 422      | CSV missing required columns or malformed     |
| `CSV_TOO_LARGE`           | 413      | CSV exceeds 10MB                              |
| `SCORING_UNAVAILABLE`     | 503      | GDS down, no cache available                  |
| `SCORING_TIMEOUT`         | 200+flag | GDS slow; cached result returned              |
| `EXPLANATION_FALLBACK`    | 200+flag | Featherless unavailable; template used        |
| `INSUFFICIENT_DATA`       | 200+flag | Low completeness; tier is advisory            |
| `SMS_SEND_FAILED`         | 200+flag | SMS failed; decision still recorded           |
| `STALE_CLIMATE_DATA`      | 200+flag | Climate zone data older than current season   |
| `GDS_FALLBACK`            | 200+flag | Cypher-only scoring used (GDS unavailable)    |
| `ICPAC_FALLBACK`          | 200+flag | Open-Meteo used as drought proxy              |

### Frontend error handling

- All errors caught by Axios response interceptor.
- 401 → token refresh flow (silent, no user disruption).
- 403 → toast: "You don't have permission to perform this action."
- 404 → inline empty state (not a full-page error).
- 422 → inline form validation message.
- 503 → banner: "Service temporarily unavailable. Showing last cached data." with stale data still rendered.
- Network offline → offline banner; write actions queued to IndexedDB.
- All error toasts auto-dismiss after 8 seconds.

---

## 33. Analytics & Telemetry

### Server-side events (PostgreSQL `analytics_events`)

| Event                   | Properties                                               |
| ----------------------- | -------------------------------------------------------- | -------- |
| `officer.login`         | `{user_id, branch_id}`                                   |
| `farmer.profile_viewed` | `{farmer_id, tier, data_completeness}`                   |
| `scoring.run`           | `{farmer_id, tier, duration_ms, cached, gds_fallback}`   |
| `explanation.generated` | `{farmer_id, audience, language, fallback, duration_ms}` |
| `decision.created`      | `{farmer_id, decision, tier_system, override: bool}`     |
| `sms.sent`              | `{farmer_id, language, status}`                          |
| `enrichment.requested`  | `{farmer_id, data_types, triggered_by: "officer"         | "auto"}` |
| `masumi.job.created`    | `{job_type, agent_did}`                                  |
| `masumi.job.delivered`  | `{job_type, duration_ms, usdm_amount}`                   |
| `masumi.job.failed`     | `{job_type, error_code}`                                 |
| `identity.merged`       | `{farmer_id, confidence, matched_fields}`                |
| `identity.conflict`     | `{national_id_hash, farmer_ids}`                         |

No PII in properties. `farmer_id` is UUID only. Aggregated weekly for branch analytics dashboard (Credit Manager view).

---

## 34. Testing Strategy

### Backend (pytest)

**Unit (70% of suite):**

- Every `Service` method tested with mocked dependencies (Neo4j driver, Redis, Featherless client).
- Every Pydantic model: valid input, each invalid field variation.
- Scoring formula: 10 fixed input/output pairs with known expected tiers.
- Explanation prompt: assert system prompt not present in output; assert structured JSON is user prompt.
- Identity resolution: exact match, fuzzy match, conflict detection, phone-only match.
- Encryption utils: round-trip test for all encrypted fields.

**Integration (25%):**

- Full API routes against test PostgreSQL + test Neo4j (Docker).
- End-to-end scoring pipeline: seed 20 synthetic farmers; assert non-degenerate tier distribution.
- Masumi agent flow: against Cardano Preprod (run in CI only on `main` branch to control testnet usage).
- CSV upload: valid file, oversized file, malformed headers, duplicate national ID.

**E2E (5%):**

- Playwright: login → search farmer → view profile → submit approve decision → verify decision record in PostgreSQL.
- Playwright: login → view farmer with CLIMATE flag → verify flag banner rendered.

### Frontend (Vitest + Playwright)

- Component: all components with React Testing Library; assert ARIA roles and keyboard navigation.
- Hook: `useFarmer`, `useDecision` with MSW (mock service worker) API mocks.
- D3 graph: assert node count matches API fixture; assert farmer node is centre.
- E2E Playwright: against staging API.
- Accessibility: `axe-core` assertions in all component tests.

### Test data

```bash
# Reproducible synthetic dataset
python seed/generate_synthetic.py --seed 42 --farmers 200 --cooperatives 5 --seasons 3
# Produces deterministic output for CI assertions
```

### Coverage targets

- Backend: ≥80% line coverage (enforced in CI: `--cov-fail-under=80`).
- Frontend: ≥70% branch coverage.
- Mutation testing: `mutmut` on scoring formula (must survive >80% of mutations).

---

## 35. Deployment Strategy

### MVP / Hackathon demo

All services run locally via `docker compose up`. Neo4j: local container with GDS plugin. Graph seeded with `python seed/seed_graph.py --demo-profiles`. Dashboard on `http://localhost:3000`. Masumi on Cardano Preprod (testnet). Demo walkthrough uses 3 pre-seeded farmer profiles.

### Staging (automatic)

Push to `develop` → GitHub Actions → `flyctl deploy --app mizizi-api-staging`. Fly Postgres + Redis (managed). Neo4j: separate AuraDB free-tier instance for staging. Masumi: Preprod. Africa's Talking: sandbox. 200-farmer synthetic seed.

### Production

Push to `main` → GitHub Actions → manual approval gate → `flyctl deploy --app mizizi-api`. Fly Postgres Professional + Redis Upstash. Neo4j: AuraDB Professional (GDS enabled). Masumi: Mainnet (post-MVP). Africa's Talking: production shortcode. Zero-downtime: Fly rolling deploy (health check before old machine termination).

**Health check endpoint:**

```python
@app.get("/health")
async def health():
    neo4j_ok = await check_neo4j()
    redis_ok = await check_redis()
    pg_ok = await check_postgres()
    status = "ok" if all([neo4j_ok, redis_ok, pg_ok]) else "degraded"
    return {"status": status, "neo4j": neo4j_ok, "redis": redis_ok, "postgres": pg_ok}
```

Fly health check: `GET /health` every 10s; restart machine after 3 consecutive failures.

---

## 36. Environment Configuration

```bash
# .env.example — commit this; never commit .env

ENVIRONMENT=development            # development | staging | production

# Auth
JWT_PRIVATE_KEY=                   # RSA 2048 PEM private key
JWT_PUBLIC_KEY=                    # RSA 2048 PEM public key

# PostgreSQL
DATABASE_URL=postgresql+asyncpg://mizizi:mizizi@postgres:5432/mizizi

# Neo4j
NEO4J_URI=bolt://neo4j:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=mizizi-secret

# Redis
REDIS_URL=redis://redis:6379

# Featherless
FEATHERLESS_API_KEY=
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
FEATHERLESS_MODEL_PRIMARY=mistralai/Mixtral-8x7B-Instruct-v0.1
FEATHERLESS_MODEL_FALLBACK=mistralai/Mistral-7B-Instruct-v0.3

# Masumi
MASUMI_PAYMENT_SERVICE_URL=http://masumi-payment:3001
MASUMI_REGISTRY_URL=http://masumi-registry:3000
MASUMI_API_KEY=
MASUMI_NETWORK=Preprod             # Preprod | Mainnet

# Africa's Talking
AT_USERNAME=
AT_API_KEY=
AT_SHORTCODE=
AT_SANDBOX=true                    # true = log only; false = real SMS
AT_WEBHOOK_SECRET=                 # HMAC secret for webhook verification

# Encryption
FIELD_ENCRYPTION_KEY=              # 32-byte hex AES-256 key

# Scoring
SCORING_VERSION=1.0.0
SCORING_CACHE_TTL=3600

# Monitoring
SENTRY_DSN=
OTLP_ENDPOINT=
LOG_LEVEL=INFO
```

---

## 37. Configuration Management

- All config via environment variables (12-factor).
- Secrets in Fly.io secrets store (encrypted at rest, injected at runtime). Never in Dockerfile or source.
- Pydantic Settings validates all config at startup; app fails fast if required variables are missing.
- Feature flags: PostgreSQL source of truth, Redis cache (5m TTL). Updated via admin API endpoint. No redeploy required for flag changes.
- Scoring weights: stored in `config` PostgreSQL table (key: `scoring_weights`, value: JSON). Loaded at scoring service startup and cached for the process lifetime. Changing weights requires `scoring_version` bump (triggers cache invalidation).

---

## 38. Feature Flags

| Flag key                 | Default (MVP) | Description                                          |
| ------------------------ | ------------- | ---------------------------------------------------- |
| `masumi_agents_enabled`  | `true`        | Enable autonomous Masumi data agents                 |
| `sms_real_delivery`      | `false`       | Use Africa's Talking real SMS; false = log only      |
| `bias_detection_enabled` | `false`       | Run demographic parity check post-scoring            |
| `graph_viz_enabled`      | `true`        | Show D3 graph neighbourhood in dashboard             |
| `override_audit_strict`  | `true`        | Require ≥20 char reason for tier override            |
| `enrichment_auto`        | `true`        | Auto-trigger enrichment for low-completeness farmers |
| `scoring_version_v2`     | `false`       | Experimental v2 scoring formula (GNN-based)          |
| `offline_action_queue`   | `true`        | Queue officer actions when offline                   |
| `insurance_module`       | `false`       | Enable insurance risk tab on farmer profile          |

Feature flag check with rollout support:

```python
async def is_enabled(flag_key: str, user_id: str = None) -> bool:
    raw = await redis.hget("feature_flags", flag_key)
    if raw is not None:
        flag = json.loads(raw)
    else:
        flag = await db_get_flag(flag_key)
        if not flag:
            return False
        await redis.hset("feature_flags", flag_key, json.dumps(flag), ex=300)

    if flag["rollout_percentage"] >= 100:
        return flag["enabled"]
    if user_id:
        bucket = int(hashlib.md5(user_id.encode()).hexdigest(), 16) % 100
        return flag["enabled"] and bucket < flag["rollout_percentage"]
    return flag["enabled"]
```

---

## 39. Data Migration Strategy

### MVP: Initial seed

```bash
# 1. Apply PostgreSQL migrations
alembic upgrade head

# 2. Apply Neo4j constraints and indexes
python migrations/migrate.py --target neo4j

# 3. Seed synthetic data
python seed/seed_graph.py \
  --farmers 50 \
  --cooperatives 3 \
  --seasons 3 \
  --demo-profiles \
  --real-climate-nakuru

# 4. Seed PostgreSQL (users, branches, feature flags)
python seed/seed_postgres.py
```

`seed_graph.py` generates:

- Synthetic Kenyan farmer names, phone numbers, counties (Faker `ke_KE` locale).
- Realistic repayment distributions (80% on-time average, normally distributed with ±15% variance).
- 3 demo profiles: `KE-NAK-00101` (Tier 1), `KE-NAK-00471` (Tier 2 + climate flag), `KE-NAK-00832` (Tier 4).
- Real Open-Meteo + ICPAC data for Nakuru County geohash grid.

### Schema migrations (Neo4j)

Migration scripts in `migrations/neo4j/` numbered sequentially. Applied via `python migrations/migrate.py`. Each script is idempotent (uses `CREATE CONSTRAINT IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).

### Schema migrations (PostgreSQL)

Managed with Alembic. `alembic upgrade head` on each deploy (applied automatically in Fly release command).

```toml
# fly.toml
[deploy]
  release_command = "alembic upgrade head"
```

### Post-MVP data import (CSV ingestion)

For pilot SACCO onboarding: cooperative provides CSV of farmer repayment records. Officer uploads via dashboard. `IngestionService` pipeline handles schema validation, identity resolution, graph writes. Progress shown in dashboard upload status panel.

---

## 40. Backup & Disaster Recovery

### Neo4j AuraDB

- Automated daily snapshots by AuraDB (7-day retention on Professional plan).
- Point-in-time recovery available.
- Manual export before any bulk seed or migration: AuraDB Console → Export.
- RTO: <2h. RPO: <24h.

### PostgreSQL (Fly Postgres)

- Fly Postgres: continuous WAL archiving to Fly object storage.
- Daily snapshots (30-day retention).
- Restore: `fly postgres backup restore --app mizizi-postgres`.
- RTO: <1h. RPO: <1h (WAL-based).

### Redis

- Fly Upstash Redis: daily RDB snapshots.
- Redis is cache-only; full loss is recoverable from Neo4j + PostgreSQL (cold cache, higher latency until warmed).
- RTO: <15min (restart + cache warm-up).

### Recovery runbook

| Failure               | Recovery steps                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| PostgreSQL down       | 1. `fly postgres failover`. 2. Verify connection string. 3. Run `alembic upgrade head`.                                                        |
| Neo4j AuraDB down     | 1. AuraDB Console: restore from latest snapshot. 2. Re-run `seed_graph.py` if demo data lost. 3. Warm GDS projections.                         |
| Redis down            | 1. Restart Fly Redis machine. 2. Cache warms automatically on first requests. 3. Scoring falls back to Neo4j direct queries until cache fills. |
| API machine failure   | Fly auto-restarts. If region-wide: `flyctl regions add lon` (add London region).                                                               |
| Celery worker failure | Tasks remain in Redis broker queue. Restart worker machine: `flyctl machine restart`.                                                          |
| Masumi Preprod outage | Use pre-recorded demo: `python demo/replay_masumi_job.py` plays back a captured Masumi transaction.                                            |

---

## 41. Project Folder Structure

```
mizizi/
├── README.md                          # Setup, demo instructions, partner bounty summary
├── ARCHITECTURE.md                    # This PRD (condensed for contributors)
├── docker-compose.yml                 # Full local stack
├── docker-compose.test.yml            # Test stack (test DBs)
├── .env.example
├── .gitignore
│
├── .github/
│   ├── workflows/
│   │   ├── main.yml                   # CI/CD pipeline
│   │   └── pr-checks.yml             # Lint + test on PRs
│   └── PULL_REQUEST_TEMPLATE.md
│
├── mizizi-api/                        # Python FastAPI backend
│   ├── Dockerfile
│   ├── requirements.txt               # Pinned versions
│   ├── requirements-dev.txt           # pytest, ruff, mypy, etc.
│   ├── pyproject.toml                 # ruff + mypy config
│   ├── alembic.ini
│   ├── alembic/versions/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── farmers.py
│   │   ├── scoring.py
│   │   ├── explanations.py
│   │   ├── decisions.py
│   │   ├── agents.py
│   │   ├── analytics.py
│   │   └── webhooks.py
│   ├── services/
│   │   ├── graph_service.py
│   │   ├── scoring_service.py
│   │   ├── explanation_service.py
│   │   ├── ingestion_service.py
│   │   ├── identity_service.py
│   │   ├── sms_service.py
│   │   └── masumi_service.py
│   ├── models/
│   │   ├── farmer.py
│   │   ├── scoring.py
│   │   ├── explanation.py
│   │   ├── decision.py
│   │   └── user.py
│   ├── db/
│   │   ├── neo4j.py
│   │   ├── postgres.py
│   │   └── redis.py
│   ├── tasks/
│   │   ├── celery_app.py
│   │   ├── scoring_tasks.py
│   │   ├── enrichment_tasks.py
│   │   └── sms_tasks.py
│   ├── utils/
│   │   ├── encryption.py
│   │   ├── validation.py
│   │   └── logging.py
│   └── tests/
│       ├── conftest.py
│       ├── unit/
│       │   ├── test_scoring_service.py
│       │   ├── test_explanation_service.py
│       │   ├── test_identity_service.py
│       │   └── test_ingestion_service.py
│       ├── integration/
│       │   ├── test_farmer_api.py
│       │   ├── test_scoring_api.py
│       │   └── test_decision_api.py
│       └── e2e/
│           └── test_officer_workflow.py
│
├── mizizi-dashboard/                  # React TypeScript frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── components.json                # shadcn/ui config
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── routes/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FarmerSearch.tsx
│   │   │   ├── FarmerProfile.tsx
│   │   │   ├── DecisionLog.tsx
│   │   │   └── Analytics.tsx
│   │   ├── components/
│   │   │   ├── farmer/
│   │   │   │   ├── FarmerHeader.tsx
│   │   │   │   ├── MetricCards.tsx
│   │   │   │   ├── RiskFlags.tsx
│   │   │   │   ├── ContributingFactors.tsx
│   │   │   │   ├── GraphNeighbourhood.tsx
│   │   │   │   ├── ActionPanel.tsx
│   │   │   │   ├── OfficerExplanation.tsx
│   │   │   │   └── UssdMockup.tsx
│   │   │   ├── ui/                    # shadcn/ui (auto-generated)
│   │   │   └── layout/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── TopBar.tsx
│   │   │       └── ProtectedLayout.tsx
│   │   ├── hooks/
│   │   │   ├── useFarmer.ts
│   │   │   ├── useScoring.ts
│   │   │   ├── useDecision.ts
│   │   │   └── useOfflineQueue.ts
│   │   ├── store/
│   │   │   └── useAppStore.ts
│   │   ├── api/
│   │   │   └── client.ts
│   │   └── types/
│   │       └── index.ts
│   └── tests/
│       ├── components/
│       └── e2e/
│
├── mizizi-agents/                     # Masumi autonomous agents
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── orchestrator/
│   │   ├── main.py
│   │   ├── gap_detector.py
│   │   └── job_dispatcher.py
│   ├── coop_data/
│   │   ├── main.py
│   │   ├── coop_client.py
│   │   └── validator.py
│   ├── climate_data/
│   │   ├── main.py
│   │   ├── openmeteo_client.py
│   │   └── icpac_client.py
│   └── shared/
│       ├── masumi_client.py
│       ├── neo4j_writer.py
│       └── consent_checker.py
│
├── seed/
│   ├── generate_synthetic.py
│   ├── seed_graph.py
│   ├── seed_postgres.py
│   └── fixtures/
│       └── demo_profiles.json         # Pre-built Tier 1/2/4 profiles
│
├── migrations/
│   └── neo4j/
│       ├── 001_initial_constraints.cypher
│       └── 002_data_source_node.cypher
│
└── demo/
    ├── replay_masumi_job.py           # Replay captured Masumi tx for offline demo
    ├── demo_script.md                 # Presenter walkthrough notes
    └── captured_transactions/
        └── climate_agent_preprod.json
```

---

## 42. Technology Stack Justification

| Component            | Choice                       | Justification                                                                                                                                                                                                                      |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Graph DB             | Neo4j Aura + GDS             | Competition partner; pathfinding = explanation by construction; GDS is production-grade; Louvain + centrality cover all scoring dimensions without custom algorithm code                                                           |
| API framework        | FastAPI (Python 3.12)        | Async-native; automatic OpenAPI docs; same language as scoring and agent code; Pydantic validation throughout; large ecosystem for data/ML adjacent work                                                                           |
| Graph scoring        | Neo4j GDS                    | Avoids maintaining custom algorithm implementations; GDS runs in-memory against the live graph; no data export required; well-tested and documented                                                                                |
| LLM provider         | Featherless AI               | Competition partner; open-source models deployable in SACCO environments without per-token commercial licensing; OpenAI-compatible API (minimal integration effort); Mixtral-8x7B strong on multilingual tasks including Kiswahili |
| Agent payments       | Masumi (Cardano)             | Competition partner; on-chain escrow matches the data incentive use case exactly; immutable audit log aligns with consent/compliance requirements; Python SDK; Docker dev environment available                                    |
| Frontend             | React 18 + Vite + shadcn/ui  | Ecosystem maturity; TypeScript; Lovable scaffolds React natively; shadcn/ui provides accessible, clean components without opinionated styling conflicts                                                                            |
| Frontend scaffolding | Lovable                      | Competition partner; AI app builder reduces time on non-graph UI work; Kevin focuses on Neo4j backend, Mercy iterates on UI in Lovable; all generated code reviewed and committed                                                  |
| Background jobs      | Celery + Redis               | Battle-tested queue/worker stack; task routing per queue; beat scheduler; idempotent retry semantics; simple to monitor                                                                                                            |
| Auth                 | JWT RS256                    | Asymmetric signing; public key distributable; 1-hour TTL; HttpOnly cookie for refresh; standard and well-understood                                                                                                                |
| SMS gateway          | Africa's Talking             | Dominant provider in Kenya/East Africa; USSD support; sandbox mode for development; reliable delivery webhook                                                                                                                      |
| Hosting              | Fly.io                       | Docker-native; low cost; Johannesburg region (lowest latency to Kenya); managed Postgres + Redis; simple CLI deploy                                                                                                                |
| ORM                  | SQLAlchemy (async) + Alembic | Production-grade; async support; Alembic for reproducible migrations                                                                                                                                                               |

---

## 43. Sequence Diagrams

### Sequence 1: Profile load, cache hit

```
Officer ──── GET /farmers/{id} ────────────────────────────► API
API ──── GET scoring:{id} ─────────────────────────────────► Redis
Redis ──── HIT: ScoringResult ─────────────────────────────► API
API ──── MATCH Farmer + neighbourhood ─────────────────────► Neo4j
Neo4j ──── Farmer + edges ─────────────────────────────────► API
API ──── GET explanation:{id}:OFFICER:EN ──────────────────► Redis
Redis ──── HIT: Explanation text ──────────────────────────► API
API ──── FarmerProfile JSON (200) ─────────────────────────► Officer
                                              ~800ms total
```

### Sequence 2: Profile load, GDS scoring run

```
Officer ──── GET /farmers/{id} ────────────────────────────► API
API ──── GET scoring:{id} ─────────────────────────────────► Redis
Redis ──── MISS ────────────────────────────────────────────► API
API ──── score_farmer(id) ─────────────────────────────────► ScoringService
ScoringService ──── Project subgraph ──────────────────────► Neo4j GDS
ScoringService ──── Louvain community detection ───────────► Neo4j GDS
ScoringService ──── Betweenness centrality ────────────────► Neo4j GDS
ScoringService ──── Cypher: repayment_consistency ─────────► Neo4j
ScoringService ──── Cypher: input_regularity ──────────────► Neo4j
ScoringService ──── Cypher: climate_risk ──────────────────► Neo4j
ScoringService ──── compute composite score ──────────────── (local)
ScoringService ──── SET scoring:{id} (TTL 1h) ─────────────► Redis
ScoringService ──── emit "farmer.scored" ──────────────────► Celery
ScoringService ──── ScoringResult ─────────────────────────► API
API ──── generate(scoring, OFFICER, EN) ───────────────────► ExplanationService
ExplanationService ──── POST /completions ─────────────────► Featherless
Featherless ──── Generated text ────────────────────────────► ExplanationService
ExplanationService ──── validate + cache (TTL 24h) ─────────► Redis
ExplanationService ──── ExplanationResult ─────────────────► API
API ──── FarmerProfile JSON (200) ─────────────────────────► Officer
                                              ~10–15s total (cold GDS)
```

### Sequence 3: Decision creation + async SMS

```
Officer ──── POST /decisions (Approve) ────────────────────► API
API ──── INSERT decision_log ───────────────────────────────► PostgreSQL
API ──── ENQUEUE sms_tasks.send_farmer_sms(id) ────────────► Celery/Redis
API ──── 201 DecisionRecord ────────────────────────────────► Officer
                                              <500ms to officer

[async — Celery worker]
Worker ──── SELECT decision_log WHERE id=? ────────────────► PostgreSQL
Worker ──── MATCH farmer.phone (decrypt) ──────────────────► Neo4j
Worker ──── GET explanation:{id}:FARMER:SW ────────────────► Redis (hit)
Worker ──── POST /messaging (SMS, ≤160 chars) ─────────────► Africa's Talking
Africa's Talking ──── SMS ──────────────────────────────────► Farmer (feature phone)
Africa's Talking ──── POST /webhooks/sms-delivery ─────────► API
API ──── UPDATE decision_log SET sms_status='DELIVERED' ───► PostgreSQL
```

### Sequence 4: Masumi agentic enrichment

```
Celery beat ──── check_graph_completeness (every 6h) ──────► enrichment_tasks
enrichment_tasks ──── MATCH low-completeness farmers ──────► Neo4j
enrichment_tasks ──── SELECT consent_records WHERE active ─► PostgreSQL
enrichment_tasks ──── dispatch_job(farmer_id, CLIMATE) ────► MasumiService
MasumiService ──── create_payment_request ─────────────────► Masumi SDK
Masumi SDK ──── Lock USDM escrow ──────────────────────────► Cardano Preprod
MasumiService ──── POST /job (spec) ───────────────────────► ClimateDataAgent
MasumiService ──── INSERT masumi_jobs (DISPATCHED) ────────► PostgreSQL

[ClimateDataAgent, async]
Agent ──── GET forecast (geohash) ─────────────────────────► Open-Meteo
Agent ──── GET drought index (zone_id) ────────────────────► ICPAC
Agent ──── aggregate → ClimateRiskZone payload ────────────── (local)
Agent ──── SHA-256 hash of payload ────────────────────────── (local)
Agent ──── MERGE ClimateRiskZone, link FarmParcel ─────────► Neo4j
Agent ──── complete_payment(output_hash) ──────────────────► Masumi SDK
Masumi SDK ──── Release escrow → USDM to agent wallet ─────► Cardano Preprod
Agent ──── UPDATE masumi_jobs (DELIVERED, tx_hash) ────────► PostgreSQL
Agent ──── CREATE DataSource node (masumi_tx_hash) ────────► Neo4j

[Back in enrichment_tasks]
enrichment_tasks ──── update_completeness_score(farmer_id) ─► Neo4j
enrichment_tasks ──── DEL scoring:{farmer_id}:latest ──────► Redis
enrichment_tasks ──── score_farmer.delay(farmer_id) ────────► Celery (re-score)
```

---

## 44. Architecture Diagrams

### Diagram 1: Physical deployment (production, Fly.io)

Three Fly.io apps in `jnb` region connected over Fly private WireGuard mesh:

- `mizizi-api` (2 machines, public HTTPS port 443) — FastAPI; handles all officer dashboard and webhook traffic.
- `mizizi-worker` (1 machine, private) — Celery workers on `sms`, `enrichment`, `scoring` queues + beat scheduler.
- `mizizi-agents` (1 machine, private) — Orchestrator, Climate, and Cooperative Masumi agents.
- `mizizi-dashboard` — Static files served via Fly static hosting or Vercel CDN (public).

Managed data services on Fly private network:

- Fly Postgres (PostgreSQL 16) — auth, audit, config.
- Fly Redis (Upstash) — queues and cache.

External services accessed over public TLS:

- Neo4j AuraDB (`neo4j+s://...`) — graph + GDS.
- Featherless API — LLM completions.
- Masumi Cardano Preprod/Mainnet — escrow contracts.
- Open-Meteo + ICPAC — climate data (agents only).
- Africa's Talking — SMS outbound (worker); delivery webhook inbound (API).

### Diagram 2: Request processing pipeline

Inbound HTTPS request hits Fly anycast → TLS termination → `mizizi-api`. FastAPI middleware stack (in order): CORS → `GZipMiddleware` → `RequestIDMiddleware` (inject `request_id`) → `LoggingMiddleware` (structured log per request) → `RateLimitMiddleware` (Redis counter) → JWT auth dependency → router.

Router dispatches to service. Service calls: Neo4j (graph data), Redis (cache), PostgreSQL (auth/audit), Celery (async tasks). Heavy operations (GDS scoring, LLM generation) either return from cache or run synchronously with a 30s timeout. On timeout: return cached result with `SCORING_TIMEOUT` flag.

### Diagram 3: Graph data model (conceptual)

Central `Farmer` node connects outward to five relationship chains:

1. `Farmer → BELONGS_TO → Cooperative` (with multiple `TOOK_OUT → Loan → HAS_REPAYMENT → RepaymentEvent` chains extending from Farmer)
2. `Farmer → MEMBER_OF → PeerGroup ← MEMBER_OF ← Farmer` (peer graph; Louvain detects communities here)
3. `Farmer → PURCHASES_FROM → InputDealer` (input purchase history)
4. `Farmer → HAS_PARCEL → FarmParcel → LOCATED_IN → ClimateRiskZone`
5. `Farmer → HAS_MOBILE_ACTIVITY → MobileMoneyFlow` (monthly aggregates)
6. `DataSource → PROVIDED → Farmer|Cooperative|ClimateRiskZone` (provenance, with Masumi tx hash)

Scoring paths (highlighted): Louvain runs on the PeerGroup + Cooperative subgraph. Centrality runs on the same subgraph. Pathfinding from `Farmer` to `RepaymentEvent` nodes produces the explanation path string.

---

## 45. Complete Development Roadmap

### Day 1–2: Graph foundation

- [ ] Provision Neo4j Aura (Professional, GDS enabled).
- [ ] Apply all constraints and indexes (`001_initial_constraints.cypher`).
- [ ] Generate 50-farmer synthetic dataset (`seed_graph.py`).
- [ ] Ingest real Open-Meteo + ICPAC data for Nakuru County.
- [ ] Configure 3 demo farmer profiles (Tier 1, 2+climate flag, 4).
- [ ] FastAPI skeleton: app, config, middleware, health endpoint.
- [ ] PostgreSQL schema: Alembic baseline migration applied.
- [ ] JWT auth: login, refresh, logout endpoints functional.
- [ ] Docker Compose: all services start cleanly with `docker compose up`.
- [ ] `GET /health` returns green.

### Day 3–4: Scoring engine + core API

- [ ] `GraphService`: neighbourhood query, repayment query, climate risk query.
- [ ] `ScoringService`: GDS Louvain, GDS Betweenness, Cypher aggregations, composite score, tier assignment.
- [ ] Redis caching on scoring result (TTL 1h).
- [ ] `POST /scoring/run` and `GET /scoring/{id}/latest` endpoints.
- [ ] `GET /farmers/{id}` endpoint (profile + neighbourhood).
- [ ] `GET /farmers/search` endpoint.
- [ ] `POST /decisions` endpoint.
- [ ] `GET /decisions/{farmer_id}` endpoint.
- [ ] PostgreSQL `decision_log` writes on decision creation.
- [ ] Celery worker + Redis broker: queue a test task, confirm it runs.
- [ ] Unit tests: scoring formula (10 known cases pass).

### Day 5: Explanation engine + dashboard

- [ ] `ExplanationService`: Featherless API call, validation, fallback templates.
- [ ] Officer explanation (EN, ≤300 words) working.
- [ ] Farmer SMS explanation (SW + EN, ≤160 chars) working.
- [ ] Explanation cached (24h, keyed by scoring version).
- [ ] Lovable: scaffold FarmerProfile page with shadcn/ui components.
- [ ] Dashboard: connect to real API (all three TanStack queries).
- [ ] MetricCards, ContributingFactors, RiskFlags components rendering live data.
- [ ] D3 GraphNeighbourhood: force layout rendering depth-1 subgraph.
- [ ] ActionPanel: Approve/Decline/More Info buttons POST to `/decisions`.
- [ ] Tier override modal with 20-char reason enforcement.
- [ ] USSD mockup: web frame showing 3-screen SMS flow in Kiswahili.

### Day 6: Masumi demo + integration + polish

- [ ] Masumi Docker services running locally (`masumi-payment`, `masumi-registry`).
- [ ] `ClimateDataAgent` registered on Preprod testnet.
- [ ] `OrchestratorAgent` detects missing climate zone for Tier 2 demo farmer.
- [ ] End-to-end Masumi job: dispatch → Open-Meteo fetch → ICPAC fetch → Neo4j write → escrow release → tx_hash stored.
- [ ] `masumi_jobs` table showing DELIVERED status in PostgreSQL.
- [ ] `GET /agents/status` returns agent health.
- [ ] Full demo rehearsal: 3 farmer profiles, Masumi live loop, explanation in two languages.
- [ ] README: setup instructions, demo script, partner bounty section.
- [ ] `demo/demo_script.md`: presenter talking points for each screen.
- [ ] Captured Masumi transaction JSON for offline demo fallback.
- [ ] All CI checks passing.

---

## 46. MVP Scope

### In scope

- Neo4j graph with synthetic + real climate data (50 farmers, 3 cooperatives, 3 seasons).
- GDS scoring: Louvain community detection, betweenness centrality, repayment consistency, input regularity, climate risk composite.
- Officer dashboard: search, profile page, graph visualisation, contributing factors, action panel, tier override.
- Explanation engine: officer (EN ≤300 words) + farmer (EN + SW ≤160 chars) via Featherless.
- USSD/SMS mockup (web simulation, not live telco).
- JWT auth with LOAN_OFFICER and CREDIT_MANAGER roles.
- Masumi agentic loop: orchestrator + climate data agent on Cardano Preprod (live demo).
- Decision audit log (PostgreSQL).
- CSV data upload for cooperative repayment records.
- Feature flags (DB-driven, admin-toggled).

### Explicitly out of scope for MVP

- Live Africa's Talking SMS delivery (mockup only; `AT_SANDBOX=true`).
- Mobile money agent (Masumi + M-Pesa consent flow).
- Insurance risk module.
- Bias detection flag and monthly audit report.
- Multi-SACCO onboarding.
- Farmer-facing web or mobile portal.
- Real cooperative API integration (synthetic data only).
- Cardano Mainnet Masumi transactions.
- WebSocket push (polling used instead).

---

## 47. Post-MVP Roadmap

### Phase 2 (1–3 months)

- Pilot SACCO onboarding: 1 branch, 5 officers, 100 real consented farmer records.
- Africa's Talking SMS live integration (`AT_SANDBOX=false`).
- Masumi mobile money agent (M-Pesa consent flow + aggregate MobileMoneyFlow nodes).
- Standardised cooperative API adapter (one connector usable by any partner cooperative).
- Farmer USSD consent flow (farmer-initiated consent via feature phone).
- Bias detection: post-scoring demographic parity check, `POTENTIAL_BIAS_DETECTED` flag, monthly admin email report.
- Branch analytics dashboard for Credit Manager.
- Sentry error tracking live.

### Phase 3 (3–6 months)

- Multi-SACCO onboarding (branch_id isolation verified at scale).
- Scoring v2: custom GNN (PyTorch Geometric, trained on pilot data) replacing Louvain + centrality. A/B tested via `scoring_version_v2` feature flag.
- Insurance risk tab on farmer profile: FarmParcel + ClimateRiskZone → indexed insurance product recommendation.
- Live cooperative API integrations (3+ partner cooperatives on Masumi marketplace).
- Farmer mobile app: React Native, basic consent management and score check.
- CBK sandbox for credit reference bureau reporting (exploratory).

### Phase 4 (6–12 months)

- Uganda + Rwanda expansion (data sovereignty compliance, local currency support).
- Open farmer identity API: portable farmer risk identity across lenders with consent.
- Masumi Sokosumi marketplace: list Cooperative Data Agents for third-party agri-fintech platforms.
- Group lending scoring module (cooperative-level, not individual).
- AML/CFT screening integration for larger loan amounts.

---

## 48. Risks & Mitigations

| Risk                                          | Prob   | Impact          | Mitigation                                                                                                                  |
| --------------------------------------------- | ------ | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Neo4j GDS timeout on small synthetic graph    | Low    | Medium          | Pre-warm projections at startup; fallback to Cypher-only scoring with `GDS_FALLBACK` flag                                   |
| Featherless API downtime                      | Medium | Medium          | 24h explanation cache; hardcoded fallback template library for all tier × audience × language combinations                  |
| Masumi Cardano Preprod instability            | High   | Low (demo only) | Pre-record captured Masumi tx JSON; `demo/replay_masumi_job.py` plays it back; live preferred, not blocking                 |
| Kiswahili LLM output quality                  | Medium | High            | Human-reviewed fallback templates ready for all 4 tiers; reviewer (Mercy) checks every generated SW explanation before demo |
| PII in LLM prompt (accidental)                | Low    | Very High       | System prompt server-side only; unit test asserts no name/phone/national_id fields in user prompt; code review gate         |
| Demo Neo4j connection failure                 | Low    | Very High       | Export graph as JSON backup before demo; static fixture server can respond to profile queries offline                       |
| Scoring bias against female farmers           | Medium | Very High       | Manual parity check of demo dataset (5 male, 5 female with equivalent repayment); bias detection in Phase 2                 |
| Lovable-generated code quality                | Medium | Medium          | All scaffolded code reviewed by Kevin before commit; backend stays Kevin-owned; Mercy owns Lovable-generated frontend       |
| Six-day timeline slip (scoring critical path) | Medium | High            | Scoring engine (Day 3–4) is the only blocker; dashboard and Masumi can be partially mocked if scoring slips                 |
| ICPAC API unavailability                      | Medium | Low             | Open-Meteo precipitation anomaly as drought proxy; `ICPAC_FALLBACK` flag; pre-cached zone data for demo area                |

---

## 49. Technical Debt Considerations

| Debt                            | Introduced by           | Acceptable until              | Payoff trigger                                       |
| ------------------------------- | ----------------------- | ----------------------------- | ---------------------------------------------------- |
| Synthetic data only             | No real cooperative API | Pilot SACCO onboarding        | First real farmer records ingested                   |
| Monolithic FastAPI app          | MVP speed               | ~50 concurrent users          | Service extraction (scoring service first)           |
| Celery on Redis broker          | MVP simplicity          | Production launch             | Redis Streams or RabbitMQ for durability             |
| Manual GDS projection refresh   | No streaming edges      | >1,000 new edges/day          | GDS streaming projection (Neo4j 5.x feature)         |
| Hardcoded scoring weights       | Expert-set, not learned | Pilot data accumulated        | Model v2 GNN (Phase 3)                               |
| Polling instead of WebSocket    | MVP simplicity          | Officer collaboration feature | WebSocket upgrade in Phase 2                         |
| No data lineage graph           | MVP scope               | Regulatory audit              | DataSource node extended with full lineage (Phase 3) |
| Lovable-scaffolded frontend     | Speed                   | Post-pilot                    | Incremental component rewrite as needed              |
| No rate limiting on Featherless | Low volume              | >100 officers                 | Token bucket in Redis                                |
| Cardano Preprod only            | MVP                     | Production launch             | Masumi Mainnet migration (Phase 2)                   |

---

## 50. Future Extensibility

### Open data agent protocol

The Masumi agent system is explicitly designed to be open. Any data provider can:

1. Implement the MIP-003 Agentic Service API (POST `/start_job`, GET `/status`).
2. Register on Masumi/Sokosumi marketplace.
3. Begin receiving USDM per verified data delivery without any direct integration with Mizizi's codebase.

The `DataSource` node schema supports any `agent_did` and `masumi_tx_hash` from any registered agent. New data types require only a new node label and relationship in the Neo4j schema — no scoring code changes until the new data type is incorporated into the scoring formula.

### Portable farmer risk identity

Every farmer has a `farmer_id` (UUID) and a set of `DataSource` nodes with immutable Masumi audit trails. This constitutes a portable, verifiable risk identity. Post-MVP, this identity can be:

- Shared across multiple lenders (with active `ConsentRecord` per institution).
- Ported to insurance platforms for individual farm-level underwriting (insurance module uses the same graph, same climate risk nodes, same farmer identity).
- Surfaced via a farmer-facing API (with appropriate auth) so farmers can view their own risk profile.

The graph schema requires no structural changes to support multi-institutional access — only new `ConsentRecord` rows with institution-scoped data source permissions.

### GNN scoring upgrade

`ScoringService` is the only component that changes when upgrading from GDS algorithms to a custom GNN. The API contracts, caching layer, explanation pipeline, and dashboard all remain unchanged. The upgrade path:

```python
# Current (GDS)
class ScoringService:
    async def score_farmer(self, farmer_id) -> ScoringResult:
        # ... GDS algorithms ...

# Post-MVP (GNN, same interface)
class ScoringServiceV2(ScoringService):
    async def score_farmer(self, farmer_id) -> ScoringResult:
        # Load PyTorch Geometric graph from Neo4j GDS client
        # Run GNN forward pass
        # Map output to ScoringResult with same contributing_factors schema
```

A/B testing between v1 and v2 is controlled by the `scoring_version_v2` feature flag with user-bucketing (e.g., 10% of officers see v2 results). Rollout gated on equivalent or better tier distribution and bias parity.

### Multi-country expansion

Adding Uganda or Rwanda requires:

1. New cooperative API connectors (agent registered per country).
2. Updated `IdentityService` validation rules (UG National ID: 14 alphanumeric; RW ID: 16 digits).
3. Currency field on Loan nodes (KES/UGX/RWF); conversion rates in `config` table.
4. New data residency configuration (Fly region: `ams` for Rwanda/Uganda if `jnb` crosses data borders).
5. Compliance docs: Uganda Data Protection and Privacy Act 2019; Rwanda Law 058-bis on Personal Data Protection.

**No Neo4j schema changes required.** The county/ward fields already support country-level prefixing by convention (`KE-NAK-...`, `UG-KLA-...`). ICPAC and Open-Meteo already cover Kenya, Uganda, and Rwanda.

---

_End of Mizizi Technical PRD v1.0.0_

_Prepared by LESOM Dynamics for Kenya AI Challenge 2026 — AgriFin Finance Challenge_

_This document is the canonical implementation specification. All architectural decisions documented herein supersede verbal specifications. Assumptions are marked inline. An AI coding agent implementing this system should begin with Section 45 (Development Roadmap) and reference individual functional requirement sections (FR-001 through FR-008) for implementation detail on each feature._
