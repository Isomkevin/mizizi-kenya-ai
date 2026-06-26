import { createServerFn } from "@tanstack/react-start";

import {
  getDecision,
  listDecisions,
  submitDecision,
  type SubmitDecisionInput,
} from "@/server/services/decisions";

export const listDecisionsFn = createServerFn({ method: "GET" })
  .validator(
    (data: { status?: "pending" | "approved" | "declined" | "override"; limit?: number }) => data,
  )
  .handler(async ({ data }) => {
    return listDecisions(data);
  });

export const getDecisionFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return getDecision(data.id);
  });

export const submitDecisionFn = createServerFn({ method: "POST" })
  .validator((data: SubmitDecisionInput) => data)
  .handler(async ({ data }) => {
    return submitDecision(data);
  });
