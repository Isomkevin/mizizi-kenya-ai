import { resetDb } from "@/server/db/local-store";
import { refreshClimate } from "@/server/services/analytics";
import { serverEnv } from "@/server/env";
import { tryRefreshGdsTrustScores } from "@/server/services/neo4j-evidence";
import { syncFarmerToGraph, verifyNeo4jConnectivity } from "@/server/services/neo4j";
import { getPersistence } from "@/server/services/persistence";

const COUNTY_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  Kiambu: { lat: -1.105, lon: 36.83 },
  Kisumu: { lat: -0.0917, lon: 34.768 },
  Nyandarua: { lat: -0.1815, lon: 36.5229 },
  Machakos: { lat: -1.5177, lon: 37.2634 },
  Kakamega: { lat: 0.2827, lon: 34.7519 },
  "Uasin Gishu": { lat: 0.5143, lon: 35.2698 },
  Meru: { lat: 0.0463, lon: 37.6559 },
  Makueni: { lat: -1.8032, lon: 37.6203 },
  "Trans Nzoia": { lat: 1.0566, lon: 34.9507 },
  Nakuru: { lat: -0.3031, lon: 36.08 },
  Kirinyaga: { lat: -0.6591, lon: 37.3827 },
  Mombasa: { lat: -4.0435, lon: 39.6682 },
};

async function run(): Promise<void> {
  const db = await resetDb();

  let graphSynced = 0;
  let climatePrimed = 0;
  for (const farmer of db.farmers) {
    const sync = await syncFarmerToGraph(farmer);
    if (sync.synced) graphSynced += 1;
  }

  const seenCounties = new Set<string>();
  for (const farmer of db.farmers) {
    if (seenCounties.has(farmer.county)) continue;
    seenCounties.add(farmer.county);
    const centroid = COUNTY_CENTROIDS[farmer.county];
    if (!centroid) continue;
    try {
      await refreshClimate({ county: farmer.county, lat: centroid.lat, lon: centroid.lon });
      climatePrimed += 1;
    } catch {
      // Seed should continue even when climate API is unavailable.
    }
  }

  await getPersistence().saveDb(await getPersistence().getDb());

  const neo4jStatus = await verifyNeo4jConnectivity();
  const gds =
    neo4jStatus.connected && serverEnv.neo4jGdsEnabled()
      ? await tryRefreshGdsTrustScores()
      : null;

  console.log(
    `Seed complete for tenant ${db.tenantId}: ${db.farmers.length} farmers, ${db.decisions.length} decisions, ${Object.keys(db.graphs).length} graphs, ${graphSynced} graph syncs, ${climatePrimed} county climate refreshes.`,
  );
  console.log(
    `Neo4j: ${neo4jStatus.connected ? "connected" : "not configured"} — ${neo4jStatus.message}`,
  );
  if (neo4jStatus.connected) {
    console.log(
      `Neo4j profile: ${neo4jStatus.profile ?? "unknown"} · farmers in graph: ${neo4jStatus.farmerNodes ?? 0}`,
    );
  }
  if (gds) {
    console.log(
      `GDS trust refresh: ${gds.gdsAvailable ? `${gds.updated} cooperative properties updated` : "plugin unavailable (using Cypher metrics)"}`,
    );
  }
}

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
