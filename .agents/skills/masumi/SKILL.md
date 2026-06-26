---
name: masumi
description: >
  Use this skill for ANY task involving Masumi Network — a decentralized
  protocol for AI agent payments and identity built on Cardano. Triggers:
  building or integrating a Masumi-enabled agentic service; implementing the
  MIP-003 Agentic Service API (POST /start_job, GET /status, etc.); setting up
  or querying a Masumi Payment Node or Registry Service; handling USDM/ADA
  wallet management (3-wallet system); registering an agent on-chain as an NFT;
  enabling Agent-to-Agent (A2A) or Human-to-Agent (H2A) payments with
  smart-contract escrow; integrating with Sokosumi marketplace or Kodosumi
  runtime; using the Masumi Python SDK (pip-masumi), N8N node, or MCP server;
  or debugging blockchain errors on Cardano Preprod/Mainnet. Do NOT use for
  general crypto/blockchain questions unrelated to Masumi.
---

# Masumi Network — Comprehensive Build Skill

## Quick Reference

| Need | Jump to |
|------|---------|
| Understand the ecosystem | [Architecture Overview](#1-architecture-overview) |
| Should I use Masumi? | [Decision Tree](#2-decision-tree) |
| Install node (Docker) | [Node Setup](#3-masumi-node-setup) |
| Implement the agent API | [MIP-003 API](#4-mip-003-agentic-service-api-standard) |
| Handle payments | [Payment Flow](#5-payment-flow--escrow) |
| Manage wallets | [Wallet System](#6-wallet-system) |
| Register an agent | [Registration](#7-agent-registration) |
| List on marketplace | [Sokosumi](#8-sokosumi-marketplace) |
| Scale deployment | [Kodosumi](#9-kodosumi-runtime) |
| Tokens & fees | [Tokens](#10-tokens--networks) |
| Python SDK | [pip-masumi](#11-python-sdk-pip-masumi) |
| N8N integration | [N8N Node](#12-n8n-node) |
| MCP server | [MCP Server](#13-masumi-mcp-server) |
| Troubleshoot | [Errors & Debugging](#14-errors--debugging) |

For deep dives on live APIs, also load files in [references/](references/) when needed.

---

## 1. Architecture Overview

### The Sumi Ecosystem (3 Platforms)

```
┌─────────────────────────────────────────────────────┐
│                   MASUMI NETWORK                    │
│  Foundational protocol: payments + identity         │
│  • Cardano blockchain escrow smart contracts        │
│  • On-chain agent registry (NFT-based)              │
│  • W3C DID decentralized identifiers                │
│  • A2A + H2A payment flows                          │
└──────────────────┬──────────────────────────────────┘
                   │
     ┌─────────────┴─────────────┐
     ▼                           ▼
┌──────────────┐         ┌──────────────┐
│  SOKOSUMI    │         │  KODOSUMI    │
│  Marketplace │         │  Runtime     │
│  • Discover  │         │  • Ray-based │
│  • List agents│        │  • Scalable  │
│  • Job mgmt  │         │  • 1000+ conc│
│  • MCP API   │         │  • Python    │
└──────────────┘         └──────────────┘
```

### Masumi Node (What You Run)

The Masumi Node = **Payment Service** + **Registry Service**

| Service | Port | Purpose | Required? |
|---------|------|---------|-----------|
| Payment Service | 3001 | Wallet mgmt, transactions, admin UI | **YES** |
| Registry Service | 3000 | Blockchain query for registered agents | Optional |
| PostgreSQL | 5432 | Node persistence layer | YES |

**External Hosted Registry:** `http://registry.masumi.network` (use this to skip self-hosting the registry service)

### Four Pillars of Masumi

1. **Transactions** — Robust payment infra for microtransactions and complex flows
2. **Decision Logging** — Immutable on-chain logging of agent outputs (SHA-256 hashes)
3. **Identity** — W3C DIDs for unique, verifiable agent identities
4. **Discovery** — Unified NFT-based registry for finding agents

---

## 2. Decision Tree

```
Do I need to accept payments for my agent service?
├─ YES → Is trustless escrow important (parties don't know each other)?
│         ├─ YES → Use Masumi (Payment Node) + optionally Sokosumi
│         └─ NO  → Sokosumi credit-based model only
│
└─ NO  → Do I need scalable deployment?
          ├─ YES → Kodosumi runtime only
          └─ NO  → May not need Masumi ecosystem
```

### Use Masumi IF you:
- Need to accept autonomous payments for services
- Want decentralized marketplace listing (Sokosumi)
- Require trustless escrow (smart contract)
- Need Agent-to-Agent (A2A) payment capabilities
- Want on-chain identity/reputation (NFT + DID)
- Operate at scale (100+ jobs/day)

### Skip Masumi IF you:
- Only serve internal/trusted users
- Handle low-value transactions (< $1 USD)
- Need sub-second payment confirmation
- Prefer centralized processors (Stripe, PayPal)
- Are a simple chatbot without monetization

---

## 3. Masumi Node Setup

### Option A: Docker Compose (Recommended)

**Prerequisites:** Docker + Docker Compose, Blockfrost API key

```bash
# 1. Clone
git clone https://github.com/masumi-network/masumi-payment-service
cd masumi-payment-service

# 2. Configure
cp .env.example .env
# Edit .env — see Environment Variables section below

# 3. Start
docker-compose up -d

# 4. Access
# Admin UI:    http://localhost:3001/admin
# Payment API: http://localhost:3001/docs
# Registry API:http://localhost:3000/docs
```

### Option B: Manual (Node.js)

**Prerequisites:** Node.js v18+, PostgreSQL 15, Blockfrost API Key

```bash
# Clone and install
git clone https://github.com/masumi-network/masumi-payment-service
cd masumi-payment-service
npm install

# DB setup
createdb masumi_payment
npx prisma migrate deploy
npx prisma db seed

# Build admin frontend
cd frontend && npm install && npm run build && cd ..

# Start
npm start
```

### One-Click Cloud Deployment (Railway)

Use the Masumi Railway template:
1. Search "Masumi Payment Service" in Railway templates
2. Provide Blockfrost API key in variables
3. Deploy → takes ~5 minutes
4. Two services created: PostgreSQL + Masumi Payment Service
5. Access at: `<your-railway-url>/admin` and `/docs`

> **Railway note:** Default admin key is in your Railway variables. API endpoints must include `/api/v1/` in the path.

### Key Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/masumi_payment"

# Blockfrost (get free key at blockfrost.io)
BLOCKFROST_API_KEY="preprod_xxx"          # for testnet
# BLOCKFROST_API_KEY="mainnet_xxx"        # for mainnet

# Security
ENCRYPTION_KEY="your-32-char-encryption-key"
ADMIN_KEY="your-admin-key-15-chars-minimum"

# Wallet seed phrases (export from admin UI, store offline)
SELLING_WALLET_MNEMONIC="word1 word2 ... word24"
PURCHASING_WALLET_MNEMONIC="word1 word2 ... word24"

# Collection wallet (address only, NOT seed phrase)
COLLECTION_WALLET_ADDRESS="addr1..."

# Network
NETWORK="Preprod"   # or "Mainnet"

# Agent settings (added after registration)
SELLER_VKEY="your_seller_verification_key"
PAYMENT_API_KEY="your_payment_api_key"
AGENT_IDENTIFIER="your_agent_identifier"  # added post-registration
```

> **Important:** `ADMIN_KEY` must be 15+ characters. After changing it, set `SEED_ONLY_IF_EMPTY=false` and re-run the seed command.

### Verify Installation

```bash
curl http://localhost:3001/api/v1/health
# Expected: { "status": "ok" }
```

---

## 4. MIP-003 Agentic Service API Standard

**This is what YOUR agent must implement.** The Masumi Node does NOT provide these endpoints — you build them.

### Required Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/start_job` | POST | Initiate a job |
| `/status` | GET | Check job status |
| `/provide_input` | POST | Send additional input (HITL) |
| `/availability` | GET | Health check (required to appear online) |
| `/input_schema` | GET | Describe expected input |
| `/demo` | GET | Example input/output (marketing) |

> **Base URL:** All endpoints relative to your service URL. Masumi API calls must include `/api/v1/` if you follow the standard slug convention.

---

### `POST /start_job`

Initiates a job. Input must match the schema from `/input_schema`.

**Request:**
```json
{
  "identifier_from_purchaser": "757365723132333",
  "input_data": [
    { "key": "topic", "value": "AI in healthcare" },
    { "key": "length", "value": "500" }
  ]
}
```

- `identifier_from_purchaser`: random hex nonce, 14–26 chars. Reuse it in the Payment Service `POST /purchase` call.

**Response (202 Accepted):**
```json
{
  "status": "success",
  "job_id": "a1b2c3d4e5f678",
  "blockchainIdentifier": "very_long_blockchain_identifier...",
  "paybytime": 1756129851,
  "submitResultTime": 1756130751,
  "unlockTime": 1756152351,
  "externalDisputeUnlockTime": 1756173951,
  "agentIdentifier": "agent_id...",
  "sellerVKey": "seller_verification_key",
  "identifierFromPurchaser": "757365723132333",
  "amounts": [{ "amount": "4200000", "unit": "" }],
  "input_hash": "sha256_hash_of_input_data"
}
```

**Error responses:** 400 (missing/invalid input), 500 (job initiation failure)

---

### `GET /status?job_id=<id>`

**Running response:**
```json
{
  "status": "running",
  "job_id": "a1b2c3d4e5f678"
}
```

**Awaiting payment:**
```json
{
  "status": "awaiting_payment",
  "job_id": "a1b2c3d4e5f678",
  "paybytime": 1756143592,
  "message": "Waiting for payment confirmation on blockchain"
}
```

**Awaiting additional input (HITL):**
```json
{
  "status": "awaiting_input",
  "job_id": "a1b2c3d4e5f678",
  "input_schema": { "clarification": { "type": "string", "description": "..." } }
}
```

**Completed:**
```json
{
  "status": "completed",
  "job_id": "a1b2c3d4e5f678",
  "result": { "output": "Generated content here..." },
  "result_hash": "sha256_of_result"
}
```

> ⚠️ The `/status` response does NOT include an `id` field. Use the `job_id` query param to track jobs.

---

### `POST /provide_input` (Human-in-the-Loop)

For jobs in `awaiting_input` state.

**Compute `input_schema_hash`:**
1. Take the `input_schema` object from `/status`
2. Serialize to canonical JSON (keys sorted lexicographically, no extra whitespace)
3. SHA-256 hash it
4. Encode as lowercase hex string (64 chars)

```json
{
  "job_id": "a1b2c3d4e5f678",
  "input_schema_hash": "abc123...64chars",
  "input_data": [{ "key": "clarification", "value": "Focus on diagnostics" }]
}
```

---

### `GET /availability`

**Required** for your agent to appear as "available" in the Masumi Payment Service.

```json
{
  "status": "available",
  "type": "masumi-agent",
  "message": "My Agent is ready to accept jobs"
}
```

---

### `GET /input_schema`

Two modes — use one, not both:

**Flat `input_data`:**
```json
{
  "status": "success",
  "input_schema": {
    "input_data": [
      { "id": "topic", "type": "string", "name": "Topic", "description": "Research topic", "required": true },
      { "id": "length", "type": "number", "name": "Word count", "description": "Output length", "required": false }
    ]
  }
}
```

**Grouped `input_groups`:**
```json
{
  "status": "success",
  "input_schema": {
    "input_groups": [
      {
        "group": "content",
        "inputs": [
          { "id": "title", "type": "string", "name": "Title", "required": true },
          { "id": "body",  "type": "string", "name": "Body",  "required": true }
        ]
      }
    ]
  }
}
```

> ⚠️ The `id` field must be **unique across the entire input schema**.

---

### `GET /demo`

```json
{
  "status": "success",
  "input_data": [{ "key": "topic", "value": "Sample topic" }],
  "output": { "result": "Sample output demonstrating capabilities..." }
}
```

---

### MIP-003 Implementation Template (Python/FastAPI)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import hashlib, json, uuid, time

app = FastAPI()
jobs = {}  # In production: use a database

class StartJobRequest(BaseModel):
    identifier_from_purchaser: str
    input_data: list[dict]

@app.post("/start_job")
async def start_job(req: StartJobRequest):
    job_id = str(uuid.uuid4())[:14]
    input_hash = hashlib.sha256(
        json.dumps(req.input_data, sort_keys=True).encode()
    ).hexdigest()
    
    jobs[job_id] = {"status": "awaiting_payment", "input": req.input_data}
    
    return {
        "status": "success",
        "job_id": job_id,
        "blockchainIdentifier": f"masumi_{job_id}_{req.identifier_from_purchaser}",
        "paybytime": int(time.time()) + 3600,
        "submitResultTime": int(time.time()) + 7200,
        "unlockTime": int(time.time()) + 86400,
        "externalDisputeUnlockTime": int(time.time()) + 172800,
        "identifierFromPurchaser": req.identifier_from_purchaser,
        "amounts": [{"amount": "2000000", "unit": ""}],
        "input_hash": input_hash,
    }

@app.get("/status")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@app.get("/availability")
async def availability():
    return {"status": "available", "type": "masumi-agent", "message": "Ready"}

@app.get("/input_schema")
async def input_schema():
    return {
        "status": "success",
        "input_schema": {
            "input_data": [
                {"id": "topic", "type": "string", "name": "Topic",
                 "description": "The topic to research", "required": True}
            ]
        }
    }

@app.get("/demo")
async def demo():
    return {
        "status": "success",
        "input_data": [{"key": "topic", "value": "AI trends 2025"}],
        "output": {"result": "AI trends in 2025 include..."}
    }
```

---

## 5. Payment Flow & Escrow

### Escrow State Machine

```
FundsLockingRequested
        ↓
    FundsLocked         ← Seller node sees payment, starts executing
        ↓
  ResultSubmitted       ← Dispute window opens
        ↓
   ┌────┴────┐
   │         │
Completed  RefundRequested
           (if buyer disputes before unlockTime)
```

### Full Purchase Flow (Buyer Perspective)

**Step 1 — Discover agent via Registry**
```bash
GET http://localhost:3000/api/v1/registry
# Returns: agent list with apiBaseUrl, pricing, sellerVkey, agentIdentifier
```

**Step 2 — Start job on the Agentic Service**
```bash
POST <apiBaseUrl>/start_job
Body: {
  "identifier_from_purchaser": "random14to26hexchars",
  "input_data": [{ "key": "topic", "value": "my input" }]
}
# Returns: blockchainIdentifier, timing params, amounts
```

**Step 3 — Lock funds in escrow (Payment Service)**
```bash
POST http://localhost:3001/api/v1/purchase
Headers: { "token": "your_api_key" }
Body: {
  "blockchainIdentifier": "<from step 2>",
  "identifierFromPurchaser": "<your nonce from step 2>",
  "sellerVkey": "<from registry>",
  "agentIdentifier": "<from registry>",
  "inputHash": "<SHA-256 of your input_data>",
  "submitResultTime": <timestamp from step 2>,
  "unlockTime": <timestamp from step 2>,
  "externalDisputeUnlockTime": <timestamp from step 2>
}
# Returns: NextAction.requestedAction = "FundsLockingRequested"
```

**Step 4 — Poll until FundsLocked (30–120s)**
```bash
GET http://localhost:3001/api/v1/purchase?id=<purchase_id>
# Wait for NextAction.requestedAction = "FundsLocked"
```

**Step 5 — Poll for result**
```bash
# Poll your agent's status endpoint
GET <apiBaseUrl>/status?job_id=<job_id>

# Once completed, verify: SHA-256(result) == result_hash
```

**Step 6 — Dispute or let complete**
- **Happy path:** Do nothing. After `unlockTime`, seller collects automatically → `Completed`
- **Dispute:** `POST /purchase/request-refund` before `unlockTime` expires

### Compute `inputHash` Correctly

```python
import hashlib, json

def compute_input_hash(input_data: list[dict]) -> str:
    canonical = json.dumps(input_data, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(canonical.encode()).hexdigest()
```

### Seller-Side Flow

Your Masumi Node **automatically**:
- Monitors the smart contract for incoming payments
- Detects when funds are locked for your agent
- Submits result hash on-chain after job completion
- Collects payment after `unlockTime`

You only need to: implement MIP-003 API + register your agent.

---

## 6. Wallet System

### Three Wallets

| Wallet | Managed By | Purpose |
|--------|-----------|---------|
| **Selling Wallet** | Masumi Node (auto-created) | Receive payments, cover registration fees |
| **Purchase Wallet** | Masumi Node (auto-created) | Lock funds to buy other agents' services |
| **Collection Wallet** | You (optional) | Withdraw earnings; top up purchase wallet |

> ⚠️ On **Preprod**, Collection Wallet is optional. On **Mainnet**, always set one.

### Get Wallet Addresses (Admin UI)

```
http://localhost:3001/admin
→ Contracts → PREPROD Contract → Purchasing Wallet → Copy address
```

### Export Seed Phrases (CRITICAL for Mainnet)

```
Admin UI → Contracts → [wallet] → Export → Copy Seed Phrase
Add to .env:
  SELLING_WALLET_MNEMONIC="word1 word2 ... word24"
  PURCHASING_WALLET_MNEMONIC="word1 word2 ... word24"
```

> 🔒 Anyone with the seed phrase controls the wallet. Store offline (paper, fireproof safe). Never put seed phrases for the Collection Wallet in .env — use the **address only**.

### Fund Wallets (Preprod/Testnet)

```bash
# 1. Copy wallet address from admin UI
# 2. Request test ADA from faucets:
#    https://faucet.masumi.network      (Masumi faucet)
#    https://docs.cardano.org/cardano-testnet/tools/faucet/  (Cardano faucet)
# 3. Wait ~5 min for confirmation
# 4. Check balance in admin UI
```

### Wallet Best Practices

- Keep minimal funds in node-managed wallets
- Automate withdrawals to Collection Wallet on high-volume services
- Create multiple offline copies of seed phrases
- Use a hardware wallet (e.g. Keystone) for Collection Wallet on Mainnet
- Or use Eternl wallet: `https://eternl.io`

---

## 7. Agent Registration

### Prerequisites

- [ ] Masumi Node installed and running
- [ ] MIP-003 API implemented and publicly accessible
- [ ] Selling Wallet funded with ADA (for registration transaction fee)
- [ ] Agent URL reachable (use ngrok if local + remote node)

### Step 1: Get Required Values from Admin UI

**Seller vKey:**
```
Admin UI → Wallets → Selling Wallet → copy vKey
```

**Payment API Key:**
```
Admin UI → API Keys → + Add API Key → copy key
```

Add to your agent's `.env`:
```env
SELLER_VKEY="your_vkey_here"
PAYMENT_API_KEY="your_api_key_here"
# AGENT_IDENTIFIER added after registration
```

### Step 2A: Register via Admin UI

```
Admin UI → AI Agents → + Register AI Agent
```

Fill in:
- **Name:** Descriptive name for your service
- **Description:** What it does
- **API URL:** `https://your-agent.com` (publicly accessible)
- **Capability:** Name + version
- **Pricing:** Amount + unit (use **USDM** for Sokosumi listing)
- **Author:** Name, contact, organization
- **Tags:** Keywords for discoverability

### Step 2B: Register via API

```bash
POST http://localhost:3001/api/v1/registry/
Headers: { "x-api-key": "your_payment_api_key" }
Body: {
  "name": "My Research Agent",
  "description": "Conducts web research on any topic",
  "apiBaseUrl": "https://my-agent.example.com",
  "capability": { "name": "web-research", "version": "1.0.0" },
  "pricing": [
    {
      "unit": "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
      "amount": "2000000"
    }
  ],
  "author": {
    "name": "Your Name",
    "contact": "you@example.com",
    "organization": "Your Org"
  },
  "tags": ["research", "web", "ai"]
}
```

**Token unit values:**
- **Preprod tUSDM:** `16a55b2a349361ff88c03788f93e1e966e5d689605d044fef722ddde0014df10745553444d`
- **Mainnet USDM:** `c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d`

### Step 3: Get Agent Identifier

Registration takes **5–15 minutes** on Preprod (blockchain confirmation).

```bash
GET http://localhost:3001/api/v1/registry/
# Wait for agentIdentifier to appear
```

Add to your agent's `.env`:
```env
AGENT_IDENTIFIER="your_agent_identifier_here"
```

### Step 4: Verify Registration

```bash
# Via Registry Service
GET http://localhost:3000/api/v1/registry-entry/

# Via Masumi Explorer
# https://explorer.masumi.network (Mainnet)
# https://preprod.sokosumi.com/agents (Preprod)
```

### Updating Agent Metadata

**Registration is immutable** (it's an on-chain NFT). To update:
1. Deregister (burns the NFT)
2. Re-register with new metadata

---

## 8. Sokosumi Marketplace

**URL:** https://app.sokosumi.com | **Preprod:** https://preprod.sokosumi.com

### Automatic Listing (Preprod)

If you register with **USDM/tUSDM pricing**, your agent automatically appears at:
`https://preprod.sokosumi.com/agents`

### Mainnet Listing

Mainnet requires team approval:
1. Register with USDM pricing on Mainnet
2. Submit whitelisting form (see Sokosumi docs)

### Sokosumi APIs

```
Main docs: https://docs.sokosumi.com
API:       https://docs.sokosumi.com/api-reference.md
MCP:       https://docs.sokosumi.com/mcp.md
App:       https://app.sokosumi.com
```

### MCP Integration

Sokosumi provides an MCP server for agent-to-agent discovery and job execution.

---

## 9. Kodosumi Runtime

**Use when:** High concurrency (1000+ concurrent jobs), Python-first workflows, Ray-based distributed execution.

```
Main docs: https://docs.kodosumi.io
Install:   https://docs.kodosumi.io/guides/installation.md
Deploy:    https://docs.kodosumi.io/guides/deploy.md
Lifecycle: https://docs.kodosumi.io/guides/lifecycle.md
Config:    https://docs.kodosumi.io/guides/config.md
API:       https://docs.kodosumi.io/api-reference.md
```

A Kodosumi-Masumi bridge provides MIP-003 compliant endpoints for agents deployed on Kodosumi:
`https://github.com/masumi-network/masumi-skills` (Kodosumi bridge)

---

## 10. Tokens & Networks

### Networks

| Network | Use Case | Cost |
|---------|---------|------|
| **Preprod** | Testing — no real money | Free (faucet) |
| **Mainnet** | Production | Real ADA/USDM |

### Tokens

| Token | Use | Unit |
|-------|-----|------|
| **ADA** | Blockchain transaction fees | 1 ADA = 1,000,000 lovelace |
| **USDM** | Service payments (≈ $1 USD) | 5% network fee applies |
| **tUSDM** | Testnet USDM (Preprod only) | Free from faucet |

### Smart Contract Addresses

```
Preprod: addr_test1wz7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsqukgwfm
Mainnet: addr1wx7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsq87ujx7
```

### Blockchain Explorers

```
Preprod: https://preprod.cardanoscan.io
Mainnet: https://cardanoscan.io
```

### Faucets (Preprod Only)

```
Masumi faucet: https://faucet.masumi.network
Cardano faucet: https://docs.cardano.org/cardano-testnet/tools/faucet/
```

---

## 11. Python SDK (pip-masumi)

```bash
pip install masumi
```

**GitHub:** https://github.com/masumi-network/pip-masumi

```python
from masumi import MasumiClient

client = MasumiClient(
    payment_service_url="http://localhost:3001",
    api_key="your_api_key"
)

# Start a purchase
purchase = client.purchase(
    blockchain_identifier="...",
    seller_vkey="...",
    agent_identifier="...",
    input_hash="...",
    identifier_from_purchaser="..."
)

# Check status
status = client.get_purchase(purchase_id=purchase.id)
```

---

## 12. N8N Node

**Package:** `n8n-nodes-masumi` (N8N community node)

**GitHub:** https://github.com/masumi-network/masumi-n8n (N8N Cardano paywall for n8n workflows)

### 3-Node Architecture

1. **Masumi Paywall Trigger** — Webhook receiver for external requests
2. **Masumi Job Processor** — Business logic (replace with your workflow)
3. **Masumi Response** — Sends result back + triggers payment settlement

### Operation Modes (select from dropdown, no manual coding)

| Mode | Endpoint | Purpose |
|------|---------|---------|
| `availability` | GET `/availability` | Health check |
| `input_schema` | GET `/input_schema` | Describe inputs (configure manually) |
| `start_job` | POST `/start_job` | Create job + payment request |
| `status` | GET `/status` | Job status + results |
| `provide_input` | POST `/provide_input` | HITL additional input |

### Split Workflow Architecture (v0.5.0+)

Jobs are immediately accessible after creation. Job creation is separated from payment polling for better responsiveness.

**Example `start_job` response:**
```json
{
  "status": "success",
  "job_id": "a1b2c3d4e5f678",
  "blockchainIdentifier": "...",
  "paybytime": 1756129851,
  "status": "awaiting_payment",
  "_internal_webhook_triggered": "fire-and-forget"
}
```

### Setup Checklist for N8N

1. Top up selling wallet with ADA (Masumi tADA dispenser: `https://dispenser.masumi.network`)
2. Register agent via Payment Service admin → provide n8n workflow URL as API URL
3. Collect from admin: admin key, agent identifier, vKey (seller verification key)
4. Configure n8n Masumi credentials with those values

---

## 13. Masumi MCP Server

An MCP server for integrating Masumi capabilities into Claude and other AI assistants.

**GitHub:** https://github.com/masumi-network/masumi-mcp-server

```bash
# Setup
git clone https://github.com/masumi-network/masumi-mcp-server
npm install

# Configure with your Payment Service URL and API key
# Add to Claude MCP config
```

**Docs:** https://docs.masumi.network/documentation/technical-documentation/_masumi-mcp-server

---

## 14. Errors & Debugging

### Common Blockchain Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `InsufficientFunds` | Wallet has no ADA | Top up via faucet or transfer |
| `TransactionTimeout` | TX not confirmed in time | Retry; check Blockfrost API key |
| `InvalidBlockchainIdentifier` | Mismatched identifier | Verify it matches `/start_job` response exactly |
| `AgentNotFound` | Registry query fails | Wait 5–15 min after registration; check Preprod vs Mainnet |
| `FundsNotLocked` | Seller starts executing but payment not confirmed | Wait 30–120s; poll `/purchase` for `FundsLocked` |
| `InputHashMismatch` | Hash doesn't match input | Use canonical JSON (sorted keys, no extra whitespace) |
| `input_schema_hash mismatch` | HITL hash wrong | Re-read `/status`, recompute SHA-256 of current `input_schema` |

### Debugging Checklist

```bash
# 1. Check node health
curl http://localhost:3001/api/v1/health

# 2. Check your agent is reachable
curl https://your-agent.com/availability

# 3. Check wallet balances (admin UI)
# http://localhost:3001/admin → Contracts → [wallet]

# 4. Check Blockfrost API key
# Must match your network (preprod vs mainnet)

# 5. Verify registration on explorer
# https://preprod.cardanoscan.io (search your selling wallet address)

# 6. Check logs
docker-compose logs masumi-payment-service -f
```

### Preprod vs Mainnet Checklist

- [ ] Blockfrost API key matches network
- [ ] Token unit uses correct policy ID (tUSDM vs USDM)
- [ ] `NETWORK` env var set correctly (`Preprod` or `Mainnet`)
- [ ] Smart contract address matches network
- [ ] Collection Wallet configured for Mainnet

---

## 15. Key URLs & Resources

### Documentation

| Resource | URL |
|---------|-----|
| Masumi Docs | https://docs.masumi.network |
| Masumi API Reference | https://docs.masumi.network/api-reference.md |
| Sokosumi Docs | https://docs.sokosumi.com |
| Sokosumi API | https://docs.sokosumi.com/api-reference.md |
| Kodosumi Docs | https://docs.kodosumi.io |
| Kodosumi API | https://docs.kodosumi.io/api-reference.md |
| MIPs (improvement proposals) | https://docs.masumi.network/mips |
| MIP-003 Full Spec | https://docs.masumi.network/mips/_mip-003 |

### Platforms & Tools

| Resource | URL |
|---------|-----|
| Sokosumi App | https://app.sokosumi.com |
| Sokosumi Preprod | https://preprod.sokosumi.com |
| Masumi Faucet | https://faucet.masumi.network |
| tADA Dispenser | https://dispenser.masumi.network |
| Cardano Faucet | https://docs.cardano.org/cardano-testnet/tools/faucet/ |
| Preprod Explorer | https://preprod.cardanoscan.io |
| Mainnet Explorer | https://cardanoscan.io |
| Eternl Wallet | https://eternl.io |

### GitHub Repositories

| Repo | URL |
|------|-----|
| Organization | https://github.com/masumi-network |
| Payment Service | https://github.com/masumi-network/masumi-payment-service |
| Registry Service | https://github.com/masumi-network/masumi-registry-service |
| Python SDK | https://github.com/masumi-network/pip-masumi |
| MCP Server | https://github.com/masumi-network/masumi-mcp-server |
| Agentic Service Wrapper | https://github.com/masumi-network/agentic-service-wrapper |
| Masumi Skills | https://github.com/masumi-network/masumi-skills |
| MIPs Repo | https://github.com/masumi-network/masumi-improvement-proposals |
| Masumi Docs | https://github.com/masumi-network/masumi-docs |

### Support

- **Email:** hello@masumi.network
- **X/Twitter:** @MasumiNetwork
- **DevRel links:** https://linktr.ee/masumidev
- **Schedule a call:** https://calendar.app.google/zHyy2VFegZw4zSKn6
- **GitHub Issues:** https://github.com/masumi-network/masumi-skills/issues

### Hosted Registry (skip self-hosting)

```
http://registry.masumi.network
```

---

## 16. Framework Integration Examples

### CrewAI + Masumi

```python
from crewai import Agent, Task, Crew
import os

# Your CrewAI agent wraps in the MIP-003 API
agent = Agent(
    role="Research Analyst",
    goal="Research any topic thoroughly",
    backstory="Expert researcher with web access",
    verbose=True
)

# In your FastAPI /start_job endpoint:
async def start_job(req: StartJobRequest):
    topic = next(d["value"] for d in req.input_data if d["key"] == "topic")
    
    task = Task(description=f"Research: {topic}", agent=agent, expected_output="Report")
    crew = Crew(agents=[agent], tasks=[task])
    
    # Run async, update job status when done
    result = crew.kickoff()
    jobs[job_id]["status"] = "completed"
    jobs[job_id]["result"] = {"output": str(result)}
```

### LangGraph + Masumi

Similar pattern: wrap your LangGraph workflow in FastAPI endpoints that implement MIP-003. The graph's final node updates job status to `completed` with the result.

### AutoGen + Masumi

Wrap AutoGen agent conversations in the MIP-003 `/start_job` → async execution → `/status` polling pattern.

---

## 17. Complete Architecture for Masumi-Enabled SuperApp

If you're building a SuperApp that hosts Mini Apps and wants to integrate Masumi agent payments:

```
SuperApp Shell (React Native)
    │
    ├── Mini App WebView (your agent UI)
    │       └── calls your Agent API (MIP-003)
    │
    └── Masumi Bridge
            ├── Payment Service (localhost:3001)
            │       ├── 3-Wallet system (Selling/Purchasing/Collection)
            │       ├── Smart contract escrow (Cardano)
            │       └── Admin UI + REST API
            │
            ├── Registry Service (localhost:3000 or registry.masumi.network)
            │       └── Query registered agents
            │
            └── Your Agentic Service
                    ├── POST /start_job
                    ├── GET  /status
                    ├── GET  /availability
                    ├── GET  /input_schema
                    └── GET  /demo
```

**Payment flow in SuperApp context:**
1. User triggers job in Mini App WebView
2. SuperApp bridge calls `/start_job` on your agent service
3. Bridge calls Masumi Payment Service `POST /purchase` to lock funds
4. Agent executes; SuperApp polls `/status`
5. Result delivered to Mini App; funds auto-released after unlock time

---

## 18. Decision Logging (Deep Dive)

Decision Logging is Masumi's accountability mechanism. Every job produces a cryptographic hash stored permanently on-chain, giving both parties verifiable proof of what was submitted and what was returned.

### What Gets Hashed

- **Input hash** — computed by the **buyer** before calling `POST /purchase`. Hash of the raw `input_data` you sent to `/start_job`.
- **Result hash** — computed by the **seller** after job completion. Hash of the output returned via `/status`. Submitted on-chain to unlock payment.

**Only the hashes go on-chain.** The actual input/output content stays private and is never written to the blockchain.

### Hash Computation (both sides must agree)

```python
import hashlib, json

def canonical_hash(data) -> str:
    """Produce a deterministic SHA-256 hex digest."""
    canonical = json.dumps(data, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(canonical.encode('utf-8')).hexdigest()

# Buyer: hash your input_data before POST /purchase
input_hash = canonical_hash(input_data_list)

# Seller: hash the result before submitting to smart contract
result_hash = canonical_hash(result_object)
```

### Why It Matters Operationally

1. **Seller can only collect payment** after submitting a valid `result_hash` to the smart contract.
2. **Buyer can open a dispute** if `result_hash` doesn't match `SHA-256(actual_result)`.
3. **Escalation** uses the on-chain hashes as evidence — no he-said/she-said.

### Three Protection Scenarios

| Scenario | Protection |
|---------|-----------|
| Seller submits nothing | Buyer requests refund after `submitResultTime` |
| Seller submits wrong hash | Hash mismatch → buyer disputes |
| Seller delivers low quality | Buyer disputes citing published Example Output |

---

## 19. Refunds & Disputes (Deep Dive)

### Four Timing Parameters (set in your Registry entry)

| Parameter | Required | Default | Description |
|-----------|---------|---------|-------------|
| `requestsPerHour` | ✅ | — | Max concurrent requests your service handles |
| `submitResultTime` | ✅ | — | Max seconds to deliver a result (set conservatively — add buffer) |
| `unlockTime` | ❌ | submitResultTime + 12h | Window for buyer to dispute after result submission |
| `refundTime` | ❌ | unlockTime + 12h | Window for seller to authorize refund before Masumi escalates |

### Dispute State Machine

```
ResultSubmitted
      ↓ (buyer calls POST /purchase/request-refund before unlockTime)
RefundRequested
      ↓ (seller calls POST /payment/authorize-refund)          ↓ (neither acts before refundTime)
RefundAuthorized                                            Disputed → Masumi team resolves
      ↓ (buyer node auto-collects)
[Refund Complete]
```

### Requesting a Refund (Buyer API Call)

```bash
POST http://localhost:3001/api/v1/purchase/request-refund
Headers: { "token": "your_api_key" }
Body: {
  "blockchainIdentifier": "<from /start_job>",
  "network": "Preprod"
}
```

Must be called **before** `unlockTime`. Only requires the `blockchainIdentifier`.

### Authorizing a Refund (Seller API Call)

```bash
POST http://localhost:3001/api/v1/payment/authorize-refund
Headers: { "token": "your_api_key" }
Body: {
  "blockchainIdentifier": "<same identifier>",
  "network": "Preprod"
}
```

Once authorized, buyer's node auto-collects the refund from the smart contract.

### Auto-Collection Schedule (Seller)

Seller's node collects unlocked payments on a cron schedule. Configure in `.env`:

```env
CHECK_COLLECTION_INTERVAL="*/5 * * * *"   # every 5 minutes
```

### Seller Checklist: Avoiding Disputes

- [ ] Registry description is accurate — don't overpromise
- [ ] Example Output in registry reflects real service quality
- [ ] `submitResultTime` has a realistic buffer (if max is 2 min, set 5 min)
- [ ] Agent service has high uptime monitoring
- [ ] Hash computation uses canonical JSON (sorted keys, no whitespace)
- [ ] Result hash covers exactly the bytes returned to buyer

---

## 20. Identity & DID System

### Agent Identity: NFT on Cardano

Every registered agent gets an NFT minted by the Registry Smart Contract. This NFT IS the agent's identity.

| Field | Description | Format |
|-------|-------------|--------|
| `policyId` | Which registry contract minted the NFT | 56 hex chars |
| `agentIdentifier` | The NFT asset name — unique on-chain handle | 64 hex chars |

```
# Example agentIdentifier:
a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
```

> ⚠️ If you lose the NFT or wallet access, deregistration is **impossible**. Secure your wallet.

### Query Registry for Agent Identity

```bash
# Search all online agents
curl -X POST https://registry.masumi.network/api/v1/registry-entry \
  -H "token: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "network": "Mainnet",
    "limit": 10,
    "filter": { "status": ["Online"] }
  }'

# Get payment details for a specific agent
curl "https://registry.masumi.network/api/v1/payment-information?agentIdentifier=a1b2c3..." \
  -H "token: your_api_key"
```

### W3C DIDs and Verifiable Credentials

Masumi supports a layered trust model on top of the NFT identity:

| Layer | What it is | Use case |
|-------|-----------|---------|
| L1 (on-chain) | NFT identity | Tamper-proof, always verifiable |
| L2 (off-chain) | W3C DIDs + VCs | Richer credentials (KYB, compliance certs) |

**Companies** can attach their DID to registry metadata, linking to verifiable credentials:
- KYB verification
- ISO certifications
- GDPR / MiCA compliance
- Masumi partnership status

**Agents** themselves can hold VCs proving:
- Regulatory compliance
- Ethical guideline adherence
- Capability benchmarks (e.g. NLP performance)

If you already have a W3C-compliant DID (e.g. from [IAMX](https://iamx.id)), it works with Masumi immediately.

---

## 21. Registry (Deep Dive)

### How the Decentralized Registry Works

There is **no central database**. The registry is a smart contract that mints/burns NFTs. Each NFT contains all metadata for one Agentic Service and sits in the agent's payment wallet.

Querying the registry = the Masumi Node scans the entire Cardano blockchain for relevant NFTs.

### Registry Service API (Read-Only, Free)

```bash
# List all health-checked agents
GET http://localhost:3000/api/v1/registry-entry/

# Get payment info for a specific agent
GET http://localhost:3000/api/v1/payment-information?agentIdentifier=<id>

# Or use the hosted registry (no self-hosting needed)
GET http://registry.masumi.network/api/v1/registry-entry/
```

> Querying the registry incurs **zero transaction fees**.

### Register / Deregister (Payment Service API, Costs ADA)

```bash
# Register (mints NFT → stored in payment wallet)
POST http://localhost:3001/api/v1/registry/
Headers: { "x-api-key": "your_api_key" }

# Deregister (burns NFT → removes from blockchain)
DELETE http://localhost:3001/api/v1/registry/
Headers: { "x-api-key": "your_api_key" }
Body: { "agentIdentifier": "your_agent_id", "network": "Preprod" }
```

> Registration/deregistration costs ADA (transaction fees). Deregistration is only possible while the NFT is in your payment wallet.

---

## 22. Transaction Fees (Full Breakdown)

### Two Fee Types

| Fee | Currency | Paid by | When |
|-----|---------|---------|------|
| Cardano blockchain fee | ADA | Both parties | Every on-chain transaction |
| Masumi network fee | **5% of selling price** in stablecoin | Seller | At payment collection |

### When Each Party Pays

**Buyer pays ADA for:**
- Locking funds into the payment smart contract (`POST /purchase`)
- Registering/deregistering their own agent

**Seller pays ADA for:**
- Submitting the result hash on-chain (decision logging)
- Collecting payment from the smart contract (+ 5% Masumi fee in USDM)
- Registering/deregistering their agent

### UTxO Minimum ADA Requirement

Masumi payment contract UTxOs store an inline datum (buyer/seller addresses, amounts, hashes, timing). This raises the minimum ADA above a typical wallet transfer:

- **Typical minimum:** 1.5–2.5 ADA per payment UTxO (depending on datum size)
- The Masumi node **automatically tops up** underfunded UTxOs during the next touching transaction

### Pricing Strategy Guidance

```
Minimum viable price = (Cardano TX fees × N_transactions) + (Masumi 5% fee) + (your compute cost)

Typical fees per complete payment cycle (Preprod):
  - Buyer lock TX: ~0.2–0.4 ADA
  - Seller result submit TX: ~0.2–0.4 ADA  
  - Seller collection TX: ~0.2–0.4 ADA + 5% of price in USDM

Rule of thumb: don't price below ~$2 USDM on L1 Cardano (L2 will change this)
```

### L2 Roadmap

Masumi is building a Cardano L2 optimized for AI agent use cases. Phase 2 will bring transaction fees down dramatically, enabling profitable microtransactions.

---

## 23. Smart Contracts

### Two Contracts

**Payment Contract**
- Implements the full escrow lifecycle (lock → result → dispute → collect)
- Stores inline datum: buyer/seller addresses, amounts, result hashes, timing params
- Enforces Decision Logging: seller can only collect after submitting valid result hash
- Handles dispute resolution logic

**Registry Contract**
- Mints and burns NFTs for agent registration
- Each NFT contains the full registry metadata on-chain
- Truly decentralized: no central database

**Governance Contract** — planned for a later phase.

### Contract Addresses

```
Payment Contract (Preprod): addr_test1wz7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsqukgwfm
Payment Contract (Mainnet): addr1wx7j4kmg2cs7yf92uat3ed4a3u97kr7axxr4avaz0lhwdsq87ujx7
```

### Why Cardano's eUTXO Model

Masumi chose Cardano specifically for its Extended UTXO (eUTXO) model:
- Avoids the global-state bottleneck of account-based chains (Ethereum)
- Enables predictable, parallelizable smart contract execution
- Critical for handling thousands of concurrent agent transactions
- Strong security model with formal verification

---

## 24. Agent Collaboration (A2A Pattern)

### Making One Agent Call Another

```python
import httpx, hashlib, json, secrets

async def hire_agent(agent_identifier: str, input_data: list[dict]):
    registry_url = "http://registry.masumi.network/api/v1"
    payment_url  = "http://localhost:3001/api/v1"

    # Step 1: Get agent payment info from registry
    r = await httpx.get(
        f"{registry_url}/payment-information",
        params={"agentIdentifier": agent_identifier},
        headers={"token": PAYMENT_API_KEY}
    )
    agent_info = r.json()["data"]
    api_base   = agent_info["apiBaseUrl"]
    seller_vkey = agent_info["sellerWallet"]["vkey"]

    # Step 2: Start the job
    nonce = secrets.token_hex(8)  # 16 hex chars, within 14–26 range
    r = await httpx.post(f"{api_base}/start_job", json={
        "identifier_from_purchaser": nonce,
        "input_data": input_data
    })
    job = r.json()

    # Step 3: Compute inputHash
    input_hash = hashlib.sha256(
        json.dumps(input_data, sort_keys=True, separators=(',', ':')).encode()
    ).hexdigest()

    # Step 4: Lock funds in escrow
    r = await httpx.post(f"{payment_url}/purchase",
        headers={"token": PAYMENT_API_KEY},
        json={
            "blockchainIdentifier":     job["blockchainIdentifier"],
            "identifierFromPurchaser":  nonce,
            "sellerVkey":               seller_vkey,
            "agentIdentifier":          agent_identifier,
            "inputHash":                input_hash,
            "submitResultTime":         job["submitResultTime"],
            "unlockTime":               job["unlockTime"],
            "externalDisputeUnlockTime": job["externalDisputeUnlockTime"],
            "network": "Preprod"
        }
    )
    purchase = r.json()

    # Step 5: Poll for FundsLocked (30–120s)
    # ... poll GET /purchase until NextAction = FundsLocked

    # Step 6: Poll agent /status for result
    # GET {api_base}/status?job_id={job["job_id"]}

    return job["job_id"], purchase["data"]["id"]
```

### Full A2A Collaboration Guide

Documented at: `https://docs.masumi.network/documentation/how-to-guides/how-to-enable-agent-collaboration`

Sequence:
1. `GET /payment-information` on remote agent's registry entry → get pricing + `apiBaseUrl`
2. `POST /start_job` on remote agent → get `blockchainIdentifier` + timing
3. `POST /purchase` on YOUR Masumi Node → lock funds
4. `GET /purchase` on YOUR node → poll for `FundsLocked`
5. If no result by `submitResultTime` → `PATCH /purchase` to request refund
6. `GET /status` on remote agent → retrieve result

---

## 25. Environments Reference

| Aspect | Preprod | Mainnet |
|--------|---------|---------|
| Purpose | Testing & development | Production |
| Cost | Free (faucet ADA) | Real ADA + USDM |
| Stablecoin | tUSDM | USDM |
| Blockfrost key prefix | `preprod_` | `mainnet_` |
| Explorer | preprod.cardanoscan.io | cardanoscan.io |
| Sokosumi | preprod.sokosumi.com | app.sokosumi.com |
| Registry | preprod auto-listed | requires whitelist form |
| Regulatory compliance | Not required | Required per local law |
| Recommendation | **Always start here** | Only after Preprod verified |

> Masumi recommends running **two separate Masumi Node setups** — one for Preprod, one for Mainnet — with separate databases and wallets.

---

## 26. API Key Permissions

API keys use three boolean flags (the old `permission` enum field is deprecated but still accepted):

| Flag | Old enum | Capabilities |
|------|---------|-------------|
| `canRead` | `Read` | Query endpoints only |
| `canPay` | `ReadAndPay` | Query + initiate payments/purchases |
| `canAdmin` | `Admin` | Full access including registration |

### Create API Key

```bash
POST http://localhost:3001/api/v1/api-key/
Headers: { "token": "your_admin_key" }
Body: {
  "canRead": true,
  "canPay": true,
  "canAdmin": false
}
```

### Common Combinations

| Use Case | `canRead` | `canPay` | `canAdmin` |
|---------|---------|---------|----------|
| Agent calling other agents | ✅ | ✅ | ❌ |
| Read-only monitoring | ✅ | ❌ | ❌ |
| Full admin (registration) | ✅ | ✅ | ✅ |

### Auth Header

```bash
# Payment Service
Headers: { "token": "your_api_key" }
# or
Headers: { "x-api-key": "your_api_key" }
```

---

## 27. Pricing Configuration Best Practices

### Setting Price on Registration

USDM uses 6 decimals. Multiply dollar amounts × 1,000,000:

```
$1.00 USDM = 1,000,000 units
$2.50 USDM = 2,500,000 units
$0.50 USDM = 500,000 units
```

### Configure Agent Pricing Guide

`https://docs.masumi.network/documentation/how-to-guides/configure-agent-pricing`

Key parameters to set in your registry metadata:
- `requestsPerHour` — throttle incoming jobs
- `submitResultTime` — your SLA (add 3–5x buffer for production)
- `unlockTime` — how long buyers have to dispute (default: submitResultTime + 12h)
- `amount` — price in USDM units
- `unit` — USDM policy ID + asset name (network-specific)

### Revenue Tips from Masumi

- Focus on **one small but highly reusable task** — single-purpose agents get hired more
- Publish a compelling **Example Output** in your registry entry
- Add **Terms of Service + Privacy Policy** to attract enterprise buyers
- Obtain a DID for your agent to signal trustworthiness
- Check Masumi Explorer to see what similar agents charge

---

## 28. Agent State Persistence

For long-running jobs that must survive service restarts, implement state persistence in your MIP-003 service.

### Pattern

```python
import json, pathlib

STATE_FILE = pathlib.Path("jobs_state.json")

def load_jobs() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}

def save_jobs(jobs: dict):
    STATE_FILE.write_text(json.dumps(jobs))

# On startup
jobs = load_jobs()

# On job update
jobs[job_id]["status"] = "running"
save_jobs(jobs)
```

For production: use a database (PostgreSQL, Redis) instead of a file. The Masumi Node itself uses PostgreSQL for its own state.

### N8N State Persistence

N8N jobs persist automatically using `this.getWorkflowStaticData('global')` — survives restarts without any extra setup.

---

## 29. Hosting Guide Summary

For publicly accessible agents (required for Masumi Network):

| Option | Best for | Notes |
|--------|---------|-------|
| **Railway** | Quick cloud deploy | Template available; add Masumi Payment Service too |
| **ngrok** | Local dev + remote node | `ngrok http 8000` → use the HTTPS URL as apiBaseUrl |
| **VPS (DigitalOcean, Hetzner)** | Production self-hosted | Run behind nginx, use Let's Encrypt TLS |
| **Kubernetes** | Enterprise scale | Combine with Kodosumi for orchestration |

> The `apiBaseUrl` in your registry entry **must be publicly reachable** (HTTPS on Mainnet). The Masumi Payment Service health-checks your `/availability` endpoint periodically.

Full guide: `https://docs.masumi.network/documentation/how-to-guides/hosting-guide`

---

*Last updated: June 2026 | Masumi Docs: https://docs.masumi.network | Skill index: https://www.masumi.network/skill.md*
