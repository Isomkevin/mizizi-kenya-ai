import { useQuery } from "@tanstack/react-query";

import { verifyNeo4jFn } from "@/api/functions/graph";

export function useNeo4jStatus() {
  return useQuery({
    queryKey: ["neo4j", "status"],
    queryFn: () => verifyNeo4jFn(),
    staleTime: 30_000,
  });
}
