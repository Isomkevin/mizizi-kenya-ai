# Neo4j setup (Mizizi)

Mizizi uses Neo4j for graph intelligence: farmer relationships, document evidence, decision paths, and the `/app/graph` workspace. The app still uses local JSON (`.data/mizizi-db.json`) for farmers and decisions; Neo4j is the graph layer on top.

Configure **one** of the options below. Both use the same env vars in your root `.env`.

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEO4J_URI` | Yes | `bolt://localhost:7687` (local) or `neo4j+s://….databases.neo4j.io` (Aura) |
| `NEO4J_PASSWORD` | Yes | Database password |
| `NEO4J_USER` | No | Default `neo4j` |
| `NEO4J_DATABASE` | No | Default `neo4j` |
| `NEO4J_PROFILE` | No | `local` or `aura` (auto-detected from URI if omitted) |
| `NEO4J_GDS` | No | Set `true` on Aura Pro to run GDS trust scoring during setup/seed |

---

## Option A — Local Neo4j (Docker)

### Quick bootstrap (recommended)

```bash
bun run neo4j:local
bun run dev
```

This merges [`.env.neo4j.local.example`](../.env.neo4j.local.example) into `.env`, starts Docker, waits for health, applies constraints, and seeds farmers into the graph.

### Manual steps

Copy credentials into `.env` (or run `bun run neo4j:env:local`):

```env
NEO4J_PROFILE=local
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=mizizi-local-dev
NEO4J_DATABASE=neo4j
```

### 2. Start Neo4j

```bash
bun run neo4j:up
```

- Browser: http://localhost:7474  
- Login: `neo4j` / `mizizi-local-dev`  
- Bolt: `bolt://localhost:7687`

### 3. Apply constraints and verify

```bash
bun run neo4j:setup
```

This waits for the container, applies `scripts/neo4j/001_constraints.cypher`, and prints graph stats.

### 4. Seed Mizizi data into the graph

```bash
bun run seed
```

### 5. Run the app

```bash
bun run dev
```

Open http://localhost:5173/app/graph — toolbar should show **Source neo4j**.

### One-command local bootstrap

After `.env` is configured:

```bash
bun run neo4j:local
```

Runs `neo4j:up` → `neo4j:setup` → `seed`.

### Stop local Neo4j

```bash
bun run neo4j:down
```

---

## Option C — Online Neo4j (Aura)

### Quick bootstrap

```bash
bun run neo4j:env:aura
# Edit .env — set NEO4J_URI and NEO4J_PASSWORD from Aura console
bun run neo4j:aura
bun run dev
```

### Manual steps

### 1. Create an Aura instance

1. Go to [neo4j.com/cloud/aura](https://neo4j.com/cloud/platform/aura-graph/)
2. Create a free or paid database
3. Save the **connection URI** and **password** (shown once)

### 2. Add Aura credentials to `.env`

Copy from [`.env.neo4j.aura.example`](../.env.neo4j.aura.example) and fill in your values:

```env
NEO4J_PROFILE=aura
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-aura-generated-password
NEO4J_DATABASE=neo4j
NEO4J_GDS=false
```

Use the exact URI from Aura (`neo4j+s://` or `neo4j+ssc://`).

### 3. Setup constraints (no Docker needed)

```bash
bun run neo4j:setup
```

### 4. Seed and run

```bash
bun run seed
bun run dev
```

### Aura Pro + GDS (optional)

On Aura Pro with the GDS plugin:

```env
NEO4J_GDS=true
```

Then:

```bash
bun run neo4j:setup -- --gds
bun run seed
```

Or run `scripts/neo4j/002_gds_optional.cypher` manually in the Aura query console.

Aura Free does **not** include GDS; core graph features still work.

---

## Verify connection

```bash
bun run neo4j:verify
```

Example output:

```json
{
  "connected": true,
  "profile": "local",
  "uri": "bolt://localhost:7687",
  "database": "neo4j",
  "farmers": 12,
  "relationships": 48,
  "message": "Neo4j connection verified."
}
```

In Neo4j Browser or Aura Query:

```cypher
MATCH (f:Farmer)-[r]->(n)
RETURN f.id, type(r), labels(n), n.id
LIMIT 25
```

---

## NPM scripts reference

| Script | Description |
| ------ | ----------- |
| `bun run neo4j:up` | Start local Docker Neo4j |
| `bun run neo4j:down` | Stop local Docker Neo4j |
| `bun run neo4j:logs` | Tail Neo4j container logs |
| `bun run neo4j:setup` | Wait, apply constraints, optional `--gds` |
| `bun run neo4j:verify` | JSON connectivity + graph stats |
| `bun run neo4j:env:local` | Merge local Neo4j vars into `.env` |
| `bun run neo4j:env:aura` | Merge Aura Neo4j vars into `.env` |
| `bun run neo4j:wait` | Wait for Docker healthcheck |
| `bun run neo4j:aura` | setup + seed (Aura, no Docker) |
| `bun run neo4j:local` | env + up + wait + setup + seed (local) |
| `bun run seed` | Reset local DB and sync farmers to Neo4j |

---

## Switching between local and Aura

1. Update `NEO4J_URI`, `NEO4J_PASSWORD`, and `NEO4J_PROFILE` in `.env`
2. Restart `bun run dev` (env is read at server start)
3. Run `bun run neo4j:setup && bun run seed` against the new target

Do not run local Docker and Aura at the same time in `.env` — point `.env` at one target only.

---

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `not configured` | Set both `NEO4J_URI` and `NEO4J_PASSWORD` in `.env` |
| Connection refused (local) | `bun run neo4j:up`, wait ~30s, retry `neo4j:verify` |
| Auth failed | Match password to Docker (`mizizi-local-dev`) or Aura console |
| TLS errors locally | Use `bolt://` not `neo4j+s://` for Docker |
| Empty graph UI | Run `bun run seed`; open `/app/graph?farmerId=f-001` |
| Source shows `local` | Neo4j unreachable; app fell back to `.data/mizizi-db.json` |

---

## Code references

- Driver: `src/server/services/neo4j.ts`
- Evidence / subgraph queries: `src/server/services/neo4j-evidence.ts`
- Graph model: [graph-model.md](./graph-model.md)
- Constraints: `scripts/neo4j/001_constraints.cypher`
