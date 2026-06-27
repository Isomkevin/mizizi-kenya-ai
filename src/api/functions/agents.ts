import { createServerFn } from "@tanstack/react-start";

import type { MasumiJobStatus } from "@/api/types";
import { grantFarmerConsent, revokeFarmerConsent } from "@/server/services/masumi/consent";
import {
  getMasumiAgentsStatus,
  handleMasumiWebhook,
  retryMasumiJob,
  runOrchestratorBatch,
} from "@/server/services/masumi/masumi-service";
import { listMasumiJobs } from "@/server/services/masumi/job-store";
import { syncFarmerDataGaps } from "@/server/services/farmer-gaps";
import { getPersistence } from "@/server/services/persistence";

export const getMasumiStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  return getMasumiAgentsStatus();
});

export const listMasumiJobsFn = createServerFn({ method: "GET" })
  .validator(
    (data: { farmerId?: string; status?: MasumiJobStatus; limit?: number } | undefined) =>
      data ?? {},
  )
  .handler(async ({ data }) => {
    return listMasumiJobs(data);
  });

export const retryMasumiJobFn = createServerFn({ method: "POST" })
  .validator((data: { jobId: string }) => data)
  .handler(async ({ data }) => {
    return retryMasumiJob(data.jobId);
  });

export const runOrchestratorFn = createServerFn({ method: "POST" })
  .validator((data: { limit?: number } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    return runOrchestratorBatch(data.limit ?? 20);
  });

export const grantConsentFn = createServerFn({ method: "POST" })
  .validator((data: { farmerId: string; scope?: string[] }) => data)
  .handler(async ({ data }) => {
    const farmer = await grantFarmerConsent(data.farmerId, data.scope);
    return syncFarmerDataGaps(farmer);
  });

export const revokeConsentFn = createServerFn({ method: "POST" })
  .validator((data: { farmerId: string }) => data)
  .handler(async ({ data }) => {
    const farmer = await revokeFarmerConsent(data.farmerId);
    return syncFarmerDataGaps(farmer);
  });

export const masumiWebhookFn = createServerFn({ method: "POST" })
  .validator((data: Record<string, unknown>) => data)
  .handler(async ({ data }) => {
    return handleMasumiWebhook(data as Parameters<typeof handleMasumiWebhook>[0]);
  });

export async function processMasumiWebhookRequest(request: Request): Promise<Response> {
  const { serverEnv } = await import("@/server/env");
  const secret = request.headers.get("x-mizizi-callback-secret");
  if (secret !== serverEnv.masumiCallbackSecret()) {
    return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await handleMasumiWebhook(
      payload as Parameters<typeof handleMasumiWebhook>[0],
    );
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
  const { serverEnv } = await import("@/server/env");
  const secret = request.headers.get("x-mizizi-callback-secret");
  if (secret !== serverEnv.masumiCallbackSecret()) {
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }
  const result = await runOrchestratorBatch(20);
  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
}
