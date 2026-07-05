import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/api/middleware/require-auth";

import {
  getPipelineEvents,
  getRecentAgentEvents,
  listRecentPipelines,
  runCreditPipeline,
} from "@/server/services/credit-pipeline";
import { listAgentEvents } from "@/server/services/agent-events";


export const runCreditPipelineFn = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator(
    (data: { farmerId: string; amount?: number; autoDrawdown?: boolean; requestedBy?: string }) =>
      data,
  )
  .handler(async ({ data }) => runCreditPipeline(data));

export const getPipelineEventsFn = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: { pipelineId: string }) => data)
  .handler(async ({ data }) => getPipelineEvents(data.pipelineId));

export const getRecentAgentEventsFn = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: { limit?: number } | undefined) => data ?? {})
  .handler(async ({ data }) => getRecentAgentEvents(data.limit));

export const getFarmerAgentEventsFn = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: { farmerId: string; limit?: number }) => data)
  .handler(async ({ data }) => listAgentEvents({ farmerId: data.farmerId, limit: data.limit }));

export const listRecentPipelinesFn = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: { limit?: number } | undefined) => data ?? {})
  .handler(async ({ data }) => listRecentPipelines(data.limit));
