import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/server/middleware/require-auth";

import type { SubmitDecisionInput } from "@/api/types";
import { getDecision, listDecisions, submitDecision } from "@/server/services/decisions";

export const listDecisionsFn = createServerFn({ method: "GET" }).middleware([requireAuth])
  .validator(
    (data: { status?: "pending" | "approved" | "declined" | "override"; limit?: number }) => data,
  )
  .handler(async ({ data }) => {
    return listDecisions(data);
  });

export const getDecisionFn = createServerFn({ method: "GET" }).middleware([requireAuth])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return getDecision(data.id);
  });

export const submitDecisionFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: SubmitDecisionInput) => data)
  .handler(async ({ data }) => {
    return submitDecision(data);
  });
