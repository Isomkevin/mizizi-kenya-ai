import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import neo4j, { type Driver } from "neo4j-driver";

export interface Neo4jEnvConfig {
  uri: string;
  user: string;
  password: string;
  database: string;
  profile: "local" | "aura" | "custom";
}

function env(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

export function resolveNeo4jProfile(uri: string): Neo4jEnvConfig["profile"] {
  const normalized = uri.toLowerCase();
  if (normalized.includes("databases.neo4j.io") || normalized.startsWith("neo4j+s://")) {
    return "aura";
  }
  if (
    normalized.includes("localhost") ||
    normalized.includes("127.0.0.1") ||
    normalized.startsWith("bolt://")
  ) {
    return "local";
  }
  return "custom";
}

export function readNeo4jEnv(): Neo4jEnvConfig | null {
  const uri = env("NEO4J_URI");
  const password = env("NEO4J_PASSWORD");
  if (!uri || !password) return null;

  const explicitProfile = env("NEO4J_PROFILE");
  const profile =
    explicitProfile === "local" || explicitProfile === "aura" || explicitProfile === "custom"
      ? explicitProfile
      : resolveNeo4jProfile(uri);

  return {
    uri,
    user: env("NEO4J_USER") ?? "neo4j",
    password,
    database: env("NEO4J_DATABASE") ?? "neo4j",
    profile,
  };
}

export function createNeo4jDriver(config: Neo4jEnvConfig): Driver {
  return neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password));
}

export function parseCypherStatements(content: string): string[] {
  const withoutBlockComments = content.replace(/\/\*[\s\S]*?\*\//g, "");
  const lines = withoutBlockComments
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter(Boolean);

  return lines
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

export async function applyCypherFile(driver: Driver, filePath: string, database: string) {
  const absolutePath = resolve(filePath);
  const content = await readFile(absolutePath, "utf-8");
  const statements = parseCypherStatements(content);
  const session = driver.session({ database });

  try {
    for (const statement of statements) {
      await session.run(statement);
    }
  } finally {
    await session.close();
  }

  return statements.length;
}

export async function waitForNeo4j(
  driver: Driver,
  database: string,
  attempts = 30,
  delayMs = 2000,
): Promise<boolean> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const session = driver.session({ database });
    try {
      await session.run("RETURN 1 AS ok");
      return true;
    } catch {
      if (attempt === attempts) return false;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs));
    } finally {
      await session.close();
    }
  }
  return false;
}

export async function getGraphStats(
  driver: Driver,
  database: string,
): Promise<{ farmers: number; relationships: number }> {
  const session = driver.session({ database });
  try {
    const result = await session.run(`
      MATCH (f:Farmer)
      WITH count(f) AS farmers
      MATCH ()-[r]->()
      RETURN farmers, count(r) AS relationships
    `);
    const record = result.records[0];
    return {
      farmers: Number(record?.get("farmers") ?? 0),
      relationships: Number(record?.get("relationships") ?? 0),
    };
  } finally {
    await session.close();
  }
}

export function rootPath(...segments: string[]): string {
  return resolve(process.cwd(), ...segments);
}
