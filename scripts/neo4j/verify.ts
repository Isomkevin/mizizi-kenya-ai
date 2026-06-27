import "./load-dotenv";
import { createNeo4jDriver, getGraphStats, readNeo4jEnv, waitForNeo4j } from "./lib";

async function run(): Promise<void> {
  const config = readNeo4jEnv();
  if (!config) {
    console.log("Neo4j: not configured (set NEO4J_URI and NEO4J_PASSWORD in .env)");
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
