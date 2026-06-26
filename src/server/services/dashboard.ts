import type { DashboardPayload } from "@/api/types";
import { getPersistence } from "@/server/services/persistence";

export async function getDashboard(): Promise<DashboardPayload> {
  const db = await getPersistence().getDb();
  return {
    welcome: db.welcome,
    kpis: db.kpis,
    riskBands: db.riskBands,
    insights: db.insights,
    activity: db.activity,
    quickActions: db.quickActions,
    counties: db.counties,
  };
}
