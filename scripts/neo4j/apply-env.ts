import "./load-dotenv";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

type Profile = "local" | "aura";

const PROFILE_FILES: Record<Profile, string> = {
  local: ".env.neo4j.local.example",
  aura: ".env.neo4j.aura.example",
};

function parseEnvLines(content: string): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) entries[key] = value;
  }
  return entries;
}

function mergeEnvFile(existing: string, updates: Record<string, string>): string {
  const lines = existing.length ? existing.split("\n") : [];
  const keys = new Set(Object.keys(updates));
  const merged = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return line;
    const key = trimmed.slice(0, eq).trim();
    if (!keys.has(key)) return line;
    const value = updates[key];
    keys.delete(key);
    return `${key}=${value}`;
  });

  if (keys.size > 0) {
    if (merged.length > 0 && merged[merged.length - 1] !== "") merged.push("");
    merged.push("# Neo4j profile (merged by bun run neo4j:env:*)");
    for (const key of keys) {
      merged.push(`${key}=${updates[key]}`);
    }
  }

  return `${merged.join("\n").replace(/\n*$/, "\n")}`;
}

async function run(): Promise<void> {
  const profile = process.argv[2] as Profile | undefined;
  if (profile !== "local" && profile !== "aura") {
    console.error("Usage: bun run neo4j:env:local | bun run neo4j:env:aura");
    process.exit(1);
  }

  const examplePath = resolve(process.cwd(), PROFILE_FILES[profile]);
  if (!existsSync(examplePath)) {
    console.error(`Missing ${PROFILE_FILES[profile]}`);
    process.exit(1);
  }

  const envPath = resolve(process.cwd(), ".env");
  const exampleContent = await readFile(examplePath, "utf-8");
  const updates = parseEnvLines(exampleContent);

  const existing = existsSync(envPath) ? await readFile(envPath, "utf-8") : "";
  const merged = mergeEnvFile(existing, updates);
  await writeFile(envPath, merged, "utf-8");

  console.log(`Merged Neo4j ${profile} profile into .env`);
  if (profile === "aura") {
    console.log("Edit .env and set NEO4J_URI + NEO4J_PASSWORD from your Aura console.");
  } else {
    console.log("Next: bun run neo4j:local");
  }
}

run().catch((error) => {
  console.error("Failed to merge Neo4j env:", error);
  process.exit(1);
});
