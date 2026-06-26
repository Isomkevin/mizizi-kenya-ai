import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { FarmerSummary, RiskLevel } from "@/api/types";
import { getFarmerFn, searchFarmerProfilesFn } from "@/api/functions/farmers";

export interface FarmerFiltersInput {
  query?: string;
  county?: string;
  cooperative?: string;
  cropType?: string;
  risk?: RiskLevel | "all";
  status?: string;
}

export function useFarmer(id?: string) {
  return useQuery({
    queryKey: ["farmers", "detail", id],
    queryFn: () => getFarmerFn({ data: { id: id ?? "" } }),
    enabled: Boolean(id),
  });
}

export function useSearchFarmers(query: string, limit = 25) {
  return useQuery({
    queryKey: ["farmers", "search", query, limit],
    queryFn: () => searchFarmerProfilesFn({ data: { query, limit } }),
    enabled: query.trim().length > 0,
  });
}

export function useFarmers(filters: FarmerFiltersInput) {
  const query = useQuery({
    queryKey: [
      "farmers",
      "profiles",
      filters.query ?? "",
      filters.county ?? "all",
      filters.risk ?? "all",
    ],
    queryFn: () =>
      searchFarmerProfilesFn({
        data: {
          query: filters.query,
          county: filters.county && filters.county !== "all" ? filters.county : undefined,
          risk: filters.risk && filters.risk !== "all" ? filters.risk : undefined,
          limit: 250,
        },
      }),
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    return rows.filter((farmer) => matchesFilters(farmer, filters));
  }, [query.data, filters]);

  return { ...query, data: filtered };
}

export function useFarmerProfile(farmerId: string) {
  return useFarmer(farmerId);
}

function matchesFilters(farmer: FarmerSummary, filters: FarmerFiltersInput) {
  const q = filters.query?.trim().toLowerCase() ?? "";
  if (
    q &&
    !`${farmer.name} ${farmer.farmerId} ${farmer.county} ${farmer.cooperative}`
      .toLowerCase()
      .includes(q)
  ) {
    return false;
  }

  if (filters.county && filters.county !== "all" && farmer.county !== filters.county) return false;
  if (
    filters.cooperative &&
    filters.cooperative !== "all" &&
    farmer.cooperative !== filters.cooperative
  ) {
    return false;
  }
  if (filters.cropType && filters.cropType !== "all" && farmer.cropType !== filters.cropType) {
    return false;
  }
  if (filters.risk && filters.risk !== "all" && farmer.risk !== filters.risk) return false;
  if (filters.status && filters.status !== "all" && farmer.applicationStatus !== filters.status) {
    return false;
  }

  return true;
}
