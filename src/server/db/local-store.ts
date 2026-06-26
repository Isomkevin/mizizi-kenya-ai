import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type {
  ActivityItem,
  AnalyticsPayload,
  CountyIntel,
  DashboardInsight,
  DashboardKpi,
  DecisionDetail,
  FarmerProfile,
  FarmerSummary,
  GraphPayload,
  QuickAction,
  SearchResult,
  WelcomeSnapshot,
} from "@/api/types";
import { buildSeedDatabase } from "@/server/db/seed-data";

export interface MiziziDatabase {
  tenantId: string;
  welcome: WelcomeSnapshot;
  kpis: DashboardKpi[];
  riskBands: import("@/api/types").RiskBand[];
  insights: DashboardInsight[];
  activity: ActivityItem[];
  quickActions: QuickAction[];
  counties: CountyIntel[];
  farmers: FarmerProfile[];
  searchIndex: SearchResult[];
  graphs: Record<string, GraphPayload>;
  decisions: DecisionDetail[];
  analytics: AnalyticsPayload;
  graphViews: { id: string; userId: string; name: string; farmerId?: string; filters: string }[];
}

const DB_PATH = join(process.cwd(), ".data", "mizizi-db.json");

let cache: MiziziDatabase | null = null;

async function ensureDb(): Promise<MiziziDatabase> {
  if (cache) return cache;
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    cache = JSON.parse(raw) as MiziziDatabase;
    return cache;
  } catch {
    cache = buildSeedDatabase();
    await mkdir(dirname(DB_PATH), { recursive: true });
    await writeFile(DB_PATH, JSON.stringify(cache, null, 2), "utf-8");
    return cache;
  }
}

export async function getDb(): Promise<MiziziDatabase> {
  return ensureDb();
}

export async function saveDb(db: MiziziDatabase): Promise<void> {
  cache = db;
  await mkdir(dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function resetDb(): Promise<MiziziDatabase> {
  cache = buildSeedDatabase();
  await saveDb(cache);
  return cache;
}
