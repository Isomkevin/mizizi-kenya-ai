import { createServerFn } from "@tanstack/react-start";

import { expandGraph, getGraph } from "@/server/services/graph";

export const getGraphFn = createServerFn({ method: "GET" })
  .validator((data: { farmerId: string }) => data)
  .handler(async ({ data }) => {
    return getGraph(data.farmerId);
  });

export const expandGraphFn = createServerFn({ method: "GET" })
  .validator((data: { rootId: string; depth: number }) => data)
  .handler(async ({ data }) => {
    return expandGraph(data.rootId, data.depth);
  });
