import { resetDb } from "@/server/db/local-store";

async function run(): Promise<void> {
  const db = await resetDb();
  console.log(
    `Seed complete for tenant ${db.tenantId}: ${db.farmers.length} farmers, ${db.decisions.length} decisions, ${Object.keys(db.graphs).length} graphs.`,
  );
}

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
