import "./load-dotenv";
import { createNeo4jDriver, getGraphStats, readNeo4jEnv, waitForNeo4j } from "./lib";
import type { Neo4jEnvConfig } from "./lib";

function detectConfigMismatch(config: Neo4jEnvConfig): string | null {
  const isLocalUri =
    config.uri.includes("localhost") ||
    config.uri.includes("127.0.0.1") ||
    config.uri.startsWith("bolt://");
  const isAuraUri =
    config.uri.includes("databases.neo4j.io") ||
    config.uri.startsWith("neo4j+s://") ||
    config.uri.startsWith("neo4j+ssc://");

  if (config.profile === "aura" && isLocalUri) {
    return "NEO4J_PROFILE is aura but NEO4J_URI still points to local Docker. Use neo4j+s://….databases.neo4j.io from the Aura console.";
  }
  if (config.profile === "local" && isAuraUri) {
    return "NEO4J_PROFILE is local but NEO4J_URI looks like Aura. Set NEO4J_PROFILE=aura or switch URI to bolt://localhost:7687.";
  }
  if (config.profile === "local" && isLocalUri && config.password.length >= 32) {
    return "Aura-style password detected with a local Docker URI. Copy NEO4J_URI from Aura (neo4j+s://….databases.neo4j.io) and set NEO4J_PROFILE=aura.";
  }
  return null;
}

async function run(): Promise<void> {
  const config = readNeo4jEnv();
  if (!config) {
    console.log("Neo4j: not configured (set NEO4J_URI and NEO4J_PASSWORD in .env)");
    process.exit(1);
  }

  const mismatch = detectConfigMismatch(config);
  if (mismatch) {
    console.log(JSON.stringify({ connected: false, configError: mismatch, uri: config.uri }, null, 2));
    process.exit(1);
  }

  const driver = createNeo4jDriver(config);
  try {
    const ready = await waitForNeo4j(driver, config.database, 5, 1000);
    if (!ready) {
      console.log(`Neo4j: unreachable at ${config.uri}`);
      process.exit(1);
    }

    const stats = await getGraphStats(driver, config.database);
    console.log(
      JSON.stringify(
        {
          connected: true,
          profile: config.profile,
          uri: config.uri,
          database: config.database,
          farmers: stats.farmers,
          relationships: stats.relationships,
          message: "Neo4j connection verified.",
        },
        null,
        2,
      ),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neo4j connectivity check failed.";
    console.log(JSON.stringify({ connected: false, message }, null, 2));
    process.exit(1);
  } finally {
    await driver.close();
  }
}

run();
