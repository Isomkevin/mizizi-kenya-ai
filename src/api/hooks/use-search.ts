import { useQuery } from "@tanstack/react-query";

import type { SearchEntityType } from "@/api/types";
import { globalSearchFn as serverGlobalSearchFn, searchFarmersFn } from "@/api/functions/search";

export const searchTypeLabels: Record<SearchEntityType, string> = {
  farmer: "Farmers",
  loan: "Loans",
  cooperative: "Cooperatives",
  county: "Counties",
  dealer: "Dealers",
  application: "Applications",
  risk: "Risk",
  decision: "Decisions",
};

export function globalSearchFn(query: string, type?: string, limit = 15) {
  return serverGlobalSearchFn({ data: { query, type, limit } });
}

export function useFarmerSearch(query: string, limit = 15) {
  return useQuery({
    queryKey: ["search", "farmers", query, limit],
    queryFn: () => searchFarmersFn({ data: { query, limit } }),
    enabled: query.trim().length > 0,
  });
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["search", "global", query, "all", 15],
    queryFn: () => globalSearchFn(query, undefined, 15),
    enabled: query.trim().length > 0,
  });
}
