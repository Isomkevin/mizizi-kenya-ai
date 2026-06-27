import "./load-dotenv";
import {
  applyCypherFile,
  createNeo4jDriver,
  getGraphStats,
  readNeo4jEnv,
  rootPath,
  waitForNeo4j,
} from "./lib";
import { tryRefreshGdsTrustScores } from "@/server/services/neo4j-evidence";

async function run(): Promise<void> {
  const config = readNeo4jEnv();
  if (!config) {
    console.error(
      "Neo4j is not configured. Add NEO4J_URI and NEO4J_PASSWORD to .env.\n" +
        "  Local:  copy .env.neo4j.local.example values into .env, then run `bun run neo4j:up`\n" +
        "  Aura:   copy .env.neo4j.aura.example values into .env",
    );
    process.exit(1);
  }

  const driver = createNeo4jDriver(config);
  try {
    console.log(`Connecting to Neo4j (${config.profile}) at ${config.uri} ...`);
    const ready = await waitForNeo4j(driver, config.database);
    if (!ready) {
      console.error(
        "Neo4j did not become ready in time.\n" +
          (config.profile === "local"
            ? "  Run `bun run neo4j:up` and wait for the container healthcheck."
            : "  Check Aura instance status and credentials."),
      );
      process.exit(1);
    }

    const constraintCount = await applyCypherFile(
      driver,
      rootPath("scripts/neo4j/001_constraints.cypher"),
      config.database,
    );
    console.log(`Applied ${constraintCount} constraint statement(s).`);

    const wantsGds =
      process.argv.includes("--gds") ||
      process.env.NEO4J_GDS === "true" ||
      process.env.NEO4J_GDS === "1";
    if (wantsGds) {
      const gds = await tryRefreshGdsTrustScores();
      console.log(
        gds.gdsAvailable
          ? `GDS PageRank updated ${gds.updated} node property value(s).`
          : "GDS plugin unavailable — skipped trust score refresh (normal on Aura Free / local).",
      );
    }

    const stats = await getGraphStats(driver, config.database);
    console.log(
      `Neo4j ready (${config.profile}). Farmers: ${stats.farmers}, relationships: ${stats.relationships}.`,
    );
    console.log("Next: run `bun run seed` to sync Mizizi farmers into the graph.");
  } finally {
    await driver.close();
  }
}

run().catch((error) => {
  console.error("Neo4j setup failed:", error);
  process.exit(1);
});
