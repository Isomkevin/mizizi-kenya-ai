import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/api/middleware/require-auth";

import type { MasumiJobStatus } from "@/api/types";
import {
  getMasumiAgentsStatus,
  retryMasumiJob,
  runOrchestratorBatch,
} from "@/server/services/masumi/masumi-service";
import { listMasumiJobs } from "@/server/services/masumi/job-store";
import { grantConsentAndSync, revokeConsentAndSync } from "@/server/routes/masumi-api";

export const getMasumiStatusFn = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(async () => {
  return getMasumiAgentsStatus();
});

export const listMasumiJobsFn = createServerFn({ method: "GET" }).middleware([requireAuth])
  .validator(
    (data: { farmerId?: string; status?: MasumiJobStatus; limit?: number } | undefined) =>
      data ?? {},
  )
  .handler(async ({ data }) => {
    return listMasumiJobs(data);
  });

export const retryMasumiJobFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: { jobId: string }) => data)
  .handler(async ({ data }) => {
    return retryMasumiJob(data.jobId);
  });

export const runOrchestratorFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: { limit?: number } | undefined) => data ?? {})
  .handler(async ({ data }) => {
    return runOrchestratorBatch(data.limit ?? 20);
  });

export const grantConsentFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: { farmerId: string; scope?: string[] }) => data)
  .handler(async ({ data }) => {
    return grantConsentAndSync(data.farmerId, data.scope);
  });

export const revokeConsentFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: { farmerId: string }) => data)
  .handler(async ({ data }) => {
    return revokeConsentAndSync(data.farmerId);
  });
