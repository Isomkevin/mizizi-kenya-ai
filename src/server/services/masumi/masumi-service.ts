import type {
  DataGapId,
  EnrichDataType,
  FarmerProfile,
  MasumiAgentHealth,
  MasumiAgentsStatusPayload,
  MasumiJob,
  MasumiJobStatus,
} from "@/api/types";
import { serverEnv } from "@/server/env";
import { countyCoordinates } from "@/server/lib/kenya-counties";
import {
  buildAgentInputForGap,
  checkAgentAvailability,
  checkPaymentServiceHealth,
  isMasumiEnabled,
  pollAgentJob,
  startAgentJob,
} from "@/server/services/masumi/agent-client";
import { assertConsentForEnrichType } from "@/server/services/masumi/consent";
import {
  applyEnrichmentResult,
  defaultCoordsForFarmer,
} from "@/server/services/masumi/enrichment-apply";
import { masumiPurchaserId } from "@/server/services/masumi/hash";
import {
  agentTypeForEnrichType,
  countMasumiJobsSince,
  getMasumiJob,
  listMasumiJobs,
  upsertMasumiJob,
} from "@/server/services/masumi/job-store";
import { syncFarmerDataGaps } from "@/server/services/farmer-gaps";
import { getPersistence } from "@/server/services/persistence";

const AGENT_ROUTES: Array<{ agentType: MasumiJob["agentType"]; route: string }> = [
  { agentType: "mizizi-climate-data", route: "climate" },
  { agentType: "mizizi-coop-data", route: "coop" },
  { agentType: "mizizi-mpesa-proxy", route: "mobile" },
  { agentType: "mizizi-orchestrator", route: "orchestrator" },
];

export async function getMasumiAgentsStatus(): Promise<MasumiAgentsStatusPayload> {
  const mode = serverEnv.masumiMode();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const pending = (await listMasumiJobs()).filter((job) =>
    ["DISPATCHED", "AWAITING_PAYMENT", "RUNNING"].includes(job.status),
  ).length;

  const db = await getPersistence().getDb();
  const agents: MasumiAgentHealth[] = [];

  for (const spec of AGENT_ROUTES) {
    const health = await checkAgentAvailability(spec.agentType);
    agents.push({
      agentType: spec.agentType,
      route: spec.route,
      status: health.status,
      message: health.message,
    });
  }

  return {
    mode: mode === "live" ? "live" : mode === "demo" ? "demo" : "disabled",
    paymentConnected: await checkPaymentServiceHealth(),
    agents,
    jobsCompleted24h: await countMasumiJobsSince(since),
    jobsPending: pending,
    orchestratorLastRun: db.masumiOrchestratorLastRun,
  };
}

export async function dispatchMasumiJob(input: {
  farmer: FarmerProfile;
  gapId: DataGapId;
  enrichType: EnrichDataType;
  requestedBy?: "officer" | "system";
}): Promise<MasumiJob> {
  if (!isMasumiEnabled()) {
    throw new Error("Masumi is disabled. Set MASUMI_MODE=demo and MASUMI_AGENTS_URL.");
  }

  const consent = assertConsentForEnrichType(input.farmer, input.enrichType);
  if (!consent.ok) {
    throw new Error(consent.reason);
  }

  const agentType = agentTypeForEnrichType(input.enrichType);
  const coords = defaultCoordsForFarmer(input.farmer);
  const inputData = buildAgentInputForGap(input.farmer, input.gapId, input.enrichType, coords);
  const purchaserId = masumiPurchaserId(input.farmer.id, input.gapId);

  const started = await startAgentJob({
    agentType,
    identifierFromPurchaser: purchaserId,
    inputData,
  });

  const job: MasumiJob = {
    id: `mj-${input.farmer.id}-${input.gapId}-${Date.now()}`,
    farmerId: input.farmer.id,
    gapId: input.gapId,
    enrichType: input.enrichType,
    agentType,
    agentJobId: started.job_id,
    blockchainIdentifier: started.blockchainIdentifier,
    inputHash: started.input_hash,
    status: started.status === "success" ? "RUNNING" : "DISPATCHED",
    requestedAt: new Date().toISOString(),
    requestedBy: input.requestedBy ?? "officer",
  };

  await upsertMasumiJob(job);
  return job;
}

async function markFarmerEnrichmentComplete(farmerId: string, gapId?: string): Promise<void> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) return;

  const jobs = (farmer.enrichmentJobs ?? []).map((job) =>
    !gapId || job.gapId === gapId
      ? { ...job, status: "complete" as const, message: "Masumi delivery confirmed." }
      : job,
  );

  await persistence.upsertFarmer({ ...farmer, enrichmentJobs: jobs });
}

export async function pollMasumiJob(job: MasumiJob): Promise<MasumiJob> {
  if (!job.agentJobId) return job;
  if (job.status === "DELIVERED" || job.status === "FAILED" || job.status === "CANCELLED") {
    return job;
  }

  try {
    const status = await pollAgentJob(job.agentType, job.agentJobId);
    if (status.status === "running" || status.status === "awaiting_payment") {
      const nextStatus: MasumiJobStatus =
        status.status === "running" ? "RUNNING" : "AWAITING_PAYMENT";
      return upsertMasumiJob({ ...job, status: nextStatus });
    }

    if (status.status === "completed" && status.result) {
      await applyEnrichmentResult(job.farmerId, status.result);
      await markFarmerEnrichmentComplete(job.farmerId, job.gapId);
      const delivered: MasumiJob = {
        ...job,
        status: "DELIVERED",
        completedAt: new Date().toISOString(),
        outputHash: status.output_hash,
        masumiTxHash: status.masumi_tx_hash ?? String(status.result.masumi_tx_hash ?? ""),
        resultSummary: String(status.result.enrichType ?? job.enrichType),
      };
      await upsertMasumiJob(delivered);
      return delivered;
    }

    if (status.status === "failed") {
      return upsertMasumiJob({
        ...job,
        status: "FAILED",
        completedAt: new Date().toISOString(),
        error: status.message ?? "Agent job failed",
      });
    }
  } catch (error) {
    return upsertMasumiJob({
      ...job,
      error: error instanceof Error ? error.message : "Poll failed",
    });
  }

  return job;
}

export async function pollPendingMasumiJobsForFarmer(farmerId: string): Promise<void> {
  const jobs = await listMasumiJobs({ farmerId });
  for (const job of jobs) {
    if (["DISPATCHED", "AWAITING_PAYMENT", "RUNNING"].includes(job.status)) {
      await pollMasumiJob(job);
    }
  }
}

export async function handleMasumiWebhook(payload: {
  job_id?: string;
  agent_name?: string;
  status?: string;
  masumi_tx_hash?: string;
  output_hash?: string;
  input_hash?: string;
  result?: Record<string, unknown>;
}): Promise<{ ok: boolean; message: string }> {
  const agentJobId = payload.job_id;
  if (!agentJobId) {
    return { ok: false, message: "Missing job_id" };
  }

  let job = await getMasumiJob(agentJobId);
  if (!job) {
    const all = await listMasumiJobs();
    job = all.find((item) => item.agentJobId === agentJobId);
  }
  if (!job) {
    return { ok: false, message: "Unknown job" };
  }

  if (payload.status === "completed" && payload.result) {
    await applyEnrichmentResult(job.farmerId, payload.result);
    await markFarmerEnrichmentComplete(job.farmerId, job.gapId);
    await upsertMasumiJob({
      ...job,
      status: "DELIVERED",
      completedAt: new Date().toISOString(),
      masumiTxHash: payload.masumi_tx_hash,
      outputHash: payload.output_hash,
      inputHash: payload.input_hash ?? job.inputHash,
      resultSummary: String(payload.result.enrichType ?? job.enrichType),
    });
    const farmer = await getPersistence().getFarmerById(job.farmerId);
    if (farmer) {
      const synced = await syncFarmerDataGaps(farmer);
      await getPersistence().upsertFarmer(synced);
    }
    return { ok: true, message: "Delivery applied" };
  }

  await pollMasumiJob(job);
  return { ok: true, message: "Job polled" };
}

export async function retryMasumiJob(jobId: string): Promise<MasumiJob> {
  const job = await getMasumiJob(jobId);
  if (!job) {
    throw new Error("Masumi job not found.");
  }
  const farmer = await getPersistence().getFarmerById(job.farmerId);
  if (!farmer || !job.gapId || job.enrichType === "ORCHESTRATION") {
    throw new Error("Cannot retry this job.");
  }
  return dispatchMasumiJob({
    farmer,
    gapId: job.gapId,
    enrichType: job.enrichType as EnrichDataType,
    requestedBy: "officer",
  });
}

export async function runOrchestratorBatch(limit = 20): Promise<{ dispatched: number }> {
  if (!isMasumiEnabled()) {
    return { dispatched: 0 };
  }

  const persistence = getPersistence();
  const farmers = await persistence.listFarmers();
  const lowCompleteness = farmers.filter((f) => f.dataCompleteness < 70).slice(0, limit);

  let dispatched = 0;
  for (const farmer of lowCompleteness) {
    const synced = await syncFarmerDataGaps(farmer);
    const missing = (synced.dataGaps ?? []).filter(
      (gap) => gap.status === "missing" && gap.enrichType,
    );
    if (!missing.length) continue;

    const coords = countyCoordinates(farmer.county);
    const gapTypes = missing.map((g) => g.id).join(",");
    const purchaserId = masumiPurchaserId(farmer.id, "orchestrator");

    try {
      const started = await startAgentJob({
        agentType: "mizizi-orchestrator",
        identifierFromPurchaser: purchaserId,
        inputData: [
          { key: "farmer_id", value: farmer.id },
          { key: "county", value: farmer.county },
          { key: "lat", value: String(coords.lat) },
          { key: "lon", value: String(coords.lon) },
          { key: "cooperative", value: farmer.cooperative },
          { key: "cooperative_id", value: `coop-${farmer.id}` },
          { key: "gap_types", value: gapTypes },
        ],
      });

      await upsertMasumiJob({
        id: `mj-orch-${farmer.id}-${Date.now()}`,
        farmerId: farmer.id,
        enrichType: "ORCHESTRATION",
        agentType: "mizizi-orchestrator",
        agentJobId: started.job_id,
        blockchainIdentifier: started.blockchainIdentifier,
        inputHash: started.input_hash,
        status: "RUNNING",
        requestedAt: new Date().toISOString(),
        requestedBy: "system",
        resultSummary: gapTypes,
      });
      dispatched += 1;
    } catch {
      // skip farmer on agent failure
    }
  }

  const db = await persistence.getDb();
  db.masumiOrchestratorLastRun = new Date().toISOString();
  await persistence.saveDb(db);

  return { dispatched };
}
