# Masumi Payment Node — Preprod deploy

Required only for **`MASUMI_MODE=live`**. Demo mode skips the Payment Node entirely.

Deploy the Payment Node **separately** from the Render Masumi blueprint (Railway recommended).

---

## Mizizi Payment Node (Railway)

| | URL |
| --- | --- |
| **Admin / dashboard** | https://masumi-payment-service-production-7ec9.up.railway.app/ |
| **API base** (`PAYMENT_SERVICE_URL` / `MASUMI_PAYMENT_URL`) | https://masumi-payment-service-production-7ec9.up.railway.app/api/v1 |
| **OpenAPI docs** | https://masumi-payment-service-production-7ec9.up.railway.app/docs |

Set on Render agents: `PAYMENT_SERVICE_URL=https://masumi-payment-service-production-7ec9.up.railway.app/api/v1`  
Set on Mizizi web: `MASUMI_PAYMENT_URL=https://masumi-payment-service-production-7ec9.up.railway.app/api/v1`  
Add `PAYMENT_API_KEY` / `MASUMI_PAYMENT_API_KEY` from the Payment admin UI (do not commit keys).  
Set `MASUMI_MODE=live` on both agents and Mizizi web.

---

## Quick start (new Payment Node)

1. Deploy [Masumi Payment Service](https://github.com/masumi-network/masumi-payment-service):
   - **Recommended:** [Railway template](https://railway.com) — search “Masumi Payment Service”
   - **Alternative:** Docker with env from [.env.example](./.env.example)
2. Provision PostgreSQL (Railway add-on or external).
3. Copy [.env.example](./.env.example) → `.env` and fill values.
4. Create a [Blockfrost](https://blockfrost.io) **Preprod** API key.
5. Generate three Preprod wallets (purchase, selling, collection) — see Masumi repo docs.
6. Fund wallets via [Masumi faucet](https://faucet.masumi.network) (ADA + test USDM).
7. Open Payment admin UI → create API key → note `PAYMENT_API_KEY` / admin key.

---

## Wire to Mizizi

After Payment Node is live:

| Service | Variable | Value |
| ------- | -------- | ----- |
| Render agents | `PAYMENT_SERVICE_URL` | `https://masumi-payment-service-production-7ec9.up.railway.app/api/v1` |
| Render agents | `PAYMENT_API_KEY` | admin API key |
| Mizizi web | `MASUMI_PAYMENT_URL` | same URL as above |
| Mizizi web | `MASUMI_PAYMENT_API_KEY` | same key as above |

Set `MASUMI_MODE=live` on both agents and Mizizi web.

---

## Verify

```bash
export PAYMENT_SERVICE_URL=https://masumi-payment-service-production-7ec9.up.railway.app/api/v1
export PAYMENT_API_KEY=your-admin-key

curl -sS "$PAYMENT_SERVICE_URL/health" | jq
curl -sS "$PAYMENT_SERVICE_URL/api-key-status" -H "token: $PAYMENT_API_KEY" | jq
```

---

## Register agents

In Payment admin, register each Mizizi agent with `network: Preprod`. Use `apiBaseUrl` values from [../agents/README.md](../agents/README.md).

Hosted registry (read-only): `https://registry.masumi.network/api/v1`

---

## Env template

See [.env.example](./.env.example) for all required Payment Node variables.

Full Render walkthrough: [../DEPLOY.md](../DEPLOY.md)
