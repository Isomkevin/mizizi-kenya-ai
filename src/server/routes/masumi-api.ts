import { syncFarmerDataGaps } from "@/server/services/farmer-gaps";
import { grantFarmerConsent, revokeFarmerConsent } from "@/server/services/masumi/consent";
import { listMasumiJobs } from "@/server/services/masumi/job-store";
import {
  getMasumiAgentsStatus,
  handleMasumiWebhook,
  retryMasumiJob,
  runOrchestratorBatch,
} from "@/server/services/masumi/masumi-service";
import { getPersistence } from "@/server/services/persistence";
import { serverEnv } from "@/server/env";

export async function processMasumiWebhookRequest(request: Request): Promise<Response> {
  const secret = request.headers.get("x-mizizi-callback-secret");
  if (secret !== serverEnv.masumiCallbackSecret()) {
    return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await handleMasumiWebhook(payload as Parameters<typeof handleMasumiWebhook>[0]);
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 400,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: error instanceof Error ? error.message : "Webhook error",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export async function getMasumiHealthResponse(): Promise<Response> {
  const status = await getMasumiAgentsStatus();
  return new Response(JSON.stringify(status), {
    headers: { "content-type": "application/json" },
  });
}

export async function triggerOrchestratorRequest(request: Request): Promise<Response> {
  const secret = request.headers.get("x-mizizi-callback-secret");
  if (secret !== serverEnv.masumiCallbackSecret()) {
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }
  const result = await runOrchestratorBatch(20);
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
}

export async function grantConsentAndSync(farmerId: string, scope?: string[]) {
  const farmer = await grantFarmerConsent(farmerId, scope);
  return syncFarmerDataGaps(farmer);
}

export async function revokeConsentAndSync(farmerId: string) {
  const farmer = await revokeFarmerConsent(farmerId);
  return syncFarmerDataGaps(farmer);
}

export async function handleWebhookPayload(payload: Record<string, unknown>) {
  const result = await handleMasumiWebhook(payload as Parameters<typeof handleMasumiWebhook>[0]);
  if (result.ok) {
    const jobId = payload.job_id as string | undefined;
    if (jobId) {
      const job = (await listMasumiJobs()).find((item) => item.agentJobId === jobId);
      if (job) {
        const farmer = await getPersistence().getFarmerById(job.farmerId);
        if (farmer) {
          const synced = await syncFarmerDataGaps(farmer);
          await getPersistence().upsertFarmer(synced);
        }
      }
    }
  }
  return result;
}
