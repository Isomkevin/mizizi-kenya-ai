import { spawnSync } from "node:child_process";

const CONTAINER = "mizizi-neo4j";
const MAX_ATTEMPTS = 36;
const DELAY_MS = 5000;

function inspectHealth(): string | null {
  const result = spawnSync(
    "docker",
    ["inspect", "-f", "{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}", CONTAINER],
    { encoding: "utf-8" },
  );
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function run(): Promise<void> {
  console.log(`Waiting for Docker container "${CONTAINER}" to become healthy...`);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const status = inspectHealth();
    if (status === "healthy") {
      console.log("Neo4j container is healthy.");
      return;
    }
    if (status === null) {
      console.error(
        `Container "${CONTAINER}" not found. Run \`bun run neo4j:up\` first.`,
      );
      process.exit(1);
    }

    console.log(`  attempt ${attempt}/${MAX_ATTEMPTS}: ${status}`);
    if (attempt < MAX_ATTEMPTS) await sleep(DELAY_MS);
  }

  console.error("Neo4j container did not become healthy in time. Check: bun run neo4j:logs");
  process.exit(1);
}

run();
