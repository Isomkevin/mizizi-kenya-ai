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
  MasumiJob,
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
  masumiJobs: MasumiJob[];
  masumiOrchestratorLastRun?: string;
}

const DB_PATH = join(process.cwd(), ".data", "mizizi-db.json");

let cache: MiziziDatabase | null = null;
let filesystemWritable: boolean | null = null;

async function canUseFilesystem(): Promise<boolean> {
  if (filesystemWritable !== null) return filesystemWritable;
  try {
    await mkdir(dirname(DB_PATH), { recursive: true });
    filesystemWritable = true;
  } catch {
    filesystemWritable = false;
  }
  return filesystemWritable;
}

async function readDbFromDisk(): Promise<MiziziDatabase | null> {
  if (!(await canUseFilesystem())) return null;
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as MiziziDatabase;
    if (!parsed.masumiJobs) parsed.masumiJobs = [];
    return parsed;
  } catch {
    return null;
  }
}

async function writeDbToDisk(db: MiziziDatabase): Promise<void> {
  if (!(await canUseFilesystem())) return;
  try {
    await mkdir(dirname(DB_PATH), { recursive: true });
    await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    // Serverless hosts (e.g. Lovable / Cloudflare Workers) may not allow fs writes.
  }
}

async function ensureDb(): Promise<MiziziDatabase> {
  if (cache) return cache;

  const fromDisk = await readDbFromDisk();
  if (fromDisk) {
    cache = fromDisk;
    return cache;
  }

  cache = buildSeedDatabase();
  await writeDbToDisk(cache);
  return cache;
}

export async function getDb(): Promise<MiziziDatabase> {
  return ensureDb();
}

export async function saveDb(db: MiziziDatabase): Promise<void> {
  cache = db;
  await writeDbToDisk(db);
}

export async function resetDb(): Promise<MiziziDatabase> {
  cache = buildSeedDatabase();
  await writeDbToDisk(cache);
  return cache;
}
