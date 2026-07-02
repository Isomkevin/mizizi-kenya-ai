import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/server/middleware/require-auth";

import {
  getCredentialForDecision,
  getZkCredentialStatus,
  issueZkCredential,
  simulateDrawdown,
} from "@/server/services/zk-credit";

export const getZkCredentialStatusFn = createServerFn({ method: "GET" })
  .validator((data: { farmerId: string }) => data)
  .handler(async ({ data }) => {
    return getZkCredentialStatus(data.farmerId);
  });

export const issueZkCredentialFn = createServerFn({ method: "POST" })
  .validator((data: { farmerId: string }) => data)
  .handler(async ({ data }) => {
    return issueZkCredential(data.farmerId);
  });

export const getDecisionZkCredentialFn = createServerFn({ method: "GET" })
  .validator((data: { farmerId: string }) => data)
  .handler(async ({ data }) => {
    return getCredentialForDecision(data.farmerId);
  });

export const simulateDrawdownFn = createServerFn({ method: "POST" })
  .validator((data: { farmerId: string; amount?: number }) => data)
  .handler(async ({ data }) => {
    return simulateDrawdown(data.farmerId, data.amount);
  });
