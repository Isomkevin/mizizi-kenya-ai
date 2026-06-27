import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const envPath = join(root, ".env");
const examplePath = join(root, ".env.masumi.example");

const MASUMI_VARS = `
# Masumi agentic data collection
MASUMI_MODE=demo
MASUMI_AGENTS_URL=http://localhost:8080
MASUMI_CALLBACK_SECRET=mizizi-dev-callback-secret
# MASUMI_PAYMENT_URL=http://localhost:3001/api/v1
# MASUMI_PAYMENT_API_KEY=
`.trim();

async function main() {
  let env = "";
  try {
    env = await readFile(envPath, "utf-8");
  } catch {
    env = "";
  }

  if (!env.includes("MASUMI_MODE=")) {
    env = `${env.trim()}\n\n${MASUMI_VARS}\n`;
    await writeFile(envPath, env, "utf-8");
    console.log("Merged Masumi vars into .env");
  } else {
    console.log(".env already has MASUMI_MODE — no changes");
  }

  await writeFile(examplePath, `# Masumi — copy vars into .env\n${MASUMI_VARS}\n`, "utf-8");
}

await main();
