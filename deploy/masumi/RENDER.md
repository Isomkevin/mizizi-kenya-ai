# Render — fix “unknown instruction: envVarGroups” / “services:”

If your build log shows:

```text
load build definition from render.yaml
dockerfile parse error: unknown instruction: envVarGroups:
```

Render is treating the **Blueprint YAML** as a **Dockerfile**. That always means the service was created wrong.

---

## Fix (5 minutes)

### 1. Delete the broken service

1. [Render Dashboard](https://dashboard.render.com)
2. Open the failing service (e.g. `mizizi-masumi-agents`)
3. **Settings** → scroll to **Delete Service** → confirm

If you created a Blueprint that only has this broken service, delete the Blueprint too.

### 2. Create via Blueprint (not Web Service)

| Do this | Not this |
| ------- | -------- |
| **New → Blueprint** | New → Web Service |
| Blueprint path: `deploy/masumi/blueprint.yaml` | Dockerfile path: `render.yaml` or `blueprint.yaml` |
| Render creates services from YAML | Manual Docker service in `deploy/masumi/` |

Steps:

1. **New** → **Blueprint**
2. Connect repo `Isomkevin/mizizi-kenya-ai`
3. **Blueprint file path:** `deploy/masumi/blueprint.yaml`
4. **Apply** → enter prompted env vars ([ENV.md](./ENV.md))
5. Wait for deploy — build log should say `load build definition from Dockerfile`, not `render.yaml`

### 3. Verify build log

Good:

```text
load build definition from Dockerfile
FROM python:3.12-slim
```

Bad (wrong setup):

```text
load build definition from render.yaml
load build definition from blueprint.yaml
unknown instruction: envVarGroups:
```

---

## Common mistakes

| Mistake | Result |
| ------- | ------ |
| Web Service → Docker, Root Dir = `deploy/masumi` | Render looks for Dockerfile; you may pick `render.yaml` by mistake |
| Dockerfile Path = `render.yaml` | YAML parsed as Dockerfile → `unknown instruction: services:` |
| Dockerfile Path = `blueprint.yaml` | Same error with `envVarGroups:` |
| Correct Dockerfile Path | **`deploy/masumi/agents/Dockerfile`** (only if creating manual Docker service — prefer Blueprint) |

**Recommended:** always use **Blueprint** with path `deploy/masumi/blueprint.yaml`. You should not configure Dockerfile Path manually.

---

## After successful deploy

```text
GET https://mizizi-masumi-agents.onrender.com/health
```

Full walkthrough: [DEPLOY.md](./DEPLOY.md)
