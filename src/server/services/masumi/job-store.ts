import type {
  DataGapId,
  EnrichDataType,
  MasumiAgentType,
  MasumiJob,
  MasumiJobStatus,
} from "@/api/types";
import { getPersistence } from "@/server/services/persistence";

export async function listMasumiJobs(filters?: {
  farmerId?: string;
  status?: MasumiJobStatus;
  limit?: number;
}): Promise<MasumiJob[]> {
  const db = await getPersistence().getDb();
  let jobs = db.masumiJobs ?? [];
  if (filters?.farmerId) {
    jobs = jobs.filter((job) => job.farmerId === filters.farmerId);
  }
  if (filters?.status) {
    jobs = jobs.filter((job) => job.status === filters.status);
  }
  jobs = [...jobs].sort(
    (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
  );
  if (filters?.limit) {
    jobs = jobs.slice(0, filters.limit);
  }
  return jobs;
}

export async function getMasumiJob(id: string): Promise<MasumiJob | undefined> {
  const db = await getPersistence().getDb();
  return (db.masumiJobs ?? []).find((job) => job.id === id || job.agentJobId === id);
}

export async function upsertMasumiJob(job: MasumiJob): Promise<MasumiJob> {
  const persistence = getPersistence();
  const db = await persistence.getDb();
  const jobs = [...(db.masumiJobs ?? [])];
  const index = jobs.findIndex((item) => item.id === job.id);
  if (index === -1) {
    jobs.unshift(job);
  } else {
    jobs[index] = job;
  }
  db.masumiJobs = jobs;
  await persistence.saveDb(db);
  return job;
}

export async function countMasumiJobsSince(since: Date): Promise<number> {
  const jobs = await listMasumiJobs();
  return jobs.filter(
    (job) =>
      job.status === "DELIVERED" &&
      job.completedAt &&
      new Date(job.completedAt).getTime() >= since.getTime(),
  ).length;
}

export function agentTypeForEnrichType(enrichType: EnrichDataType): MasumiAgentType {
  switch (enrichType) {
    case "CLIMATE":
      return "mizizi-climate-data";
    case "COOPERATIVE":
      return "mizizi-coop-data";
    case "MOBILE_MONEY":
      return "mizizi-mpesa-proxy";
    case "PARCEL":
      return "mizizi-orchestrator";
    default:
      return "mizizi-orchestrator";
  }
}

export function agentPathForType(
  agentType: MasumiAgentType,
  paths: {
    climate: string;
    coop: string;
    mobile: string;
    orchestrator: string;
  },
): string {
  switch (agentType) {
    case "mizizi-climate-data":
      return paths.climate;
    case "mizizi-coop-data":
      return paths.coop;
    case "mizizi-mpesa-proxy":
      return paths.mobile;
    default:
      return paths.orchestrator;
  }
}

export function gapIdForEnrichType(enrichType: EnrichDataType): DataGapId | undefined {
  switch (enrichType) {
    case "CLIMATE":
      return "climate_zone";
    case "COOPERATIVE":
      return "repayment";
    case "MOBILE_MONEY":
      return "mobile_activity";
    default:
      return undefined;
  }
}
