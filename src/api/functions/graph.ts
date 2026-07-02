import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/server/middleware/require-auth";

import { expandGraph, getGraph } from "@/server/services/graph";
import { verifyNeo4jConnectivity } from "@/server/services/neo4j";

export const getGraphFn = createServerFn({ method: "GET" })
  .validator((data: { farmerId: string; depth?: number }) => data)
  .handler(async ({ data }) => {
    return getGraph(data.farmerId, data.depth ?? 2);
  });

export const expandGraphFn = createServerFn({ method: "GET" })
  .validator((data: { rootId: string; depth: number }) => data)
  .handler(async ({ data }) => {
    return expandGraph(data.rootId, data.depth);
  });

export const verifyNeo4jFn = createServerFn({ method: "GET" }).handler(async () => {
  return verifyNeo4jConnectivity();
});
