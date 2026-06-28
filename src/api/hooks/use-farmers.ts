import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { farmerProfiles } from "@/api/hooks/fallback-data";
import type { CreateFarmerInput, DataGapId, FarmerSummary, RiskLevel } from "@/api/types";
import {
  createFarmerFn,
  getFarmerFn,
  requestEnrichmentFn,
  searchFarmerProfilesFn,
} from "@/api/functions/farmers";
import { findDemoFarmer, listDemoFarmers } from "@/lib/demo-seed";
import { normalizeFarmerId } from "@/lib/id-aliases";

export interface FarmerFiltersInput {
  query?: string;
  county?: string;
  cooperative?: string;
  cropType?: string;
  risk?: RiskLevel | "all";
  status?: string;
}

function resolveFarmer(id: string) {
  const lookupId = normalizeFarmerId(id);
  return (
    findDemoFarmer(lookupId) ??
    farmerProfiles[lookupId] ??
    farmerProfiles[id] ??
    null
  );
}

export function useFarmer(id?: string, initialData?: ReturnType<typeof resolveFarmer>) {
  return useQuery({
    queryKey: ["farmers", "detail", id],
    queryFn: async () => {
      const lookupId = normalizeFarmerId(id ?? "");
      try {
        const result = await getFarmerFn({ data: { id: lookupId } });
        if (result) return result;
      } catch {
        // fall through to bundled seed
      }
      return resolveFarmer(lookupId);
    },
    enabled: Boolean(id),
    initialData: initialData ?? undefined,
    placeholderData: () => (id ? resolveFarmer(id) : undefined),
  });
}

export function useSearchFarmers(query: string, limit = 25) {
  return useQuery({
    queryKey: ["farmers", "search", query, limit],
    queryFn: async () => {
      try {
        return await searchFarmerProfilesFn({ data: { query, limit } });
      } catch {
        const q = query.trim().toLowerCase();
        return listDemoFarmers(limit).filter(
          (farmer) =>
            farmer.name.toLowerCase().includes(q) ||
            farmer.farmerId.toLowerCase().includes(q) ||
            farmer.county.toLowerCase().includes(q),
        );
      }
    },
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
    queryFn: async () => {
      try {
        return await searchFarmerProfilesFn({
          data: {
            query: filters.query,
            county: filters.county && filters.county !== "all" ? filters.county : undefined,
            risk: filters.risk && filters.risk !== "all" ? filters.risk : undefined,
            limit: 250,
          },
        });
      } catch {
        return listDemoFarmers();
      }
    },
    placeholderData: () => listDemoFarmers(),
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    const rows = query.data ?? [];
    return rows.filter((farmer) => matchesFilters(farmer, filters));
  }, [query.data, filters]);

  return { ...query, data: filtered };
}

export function useFarmerProfile(farmerId: string, initialData?: ReturnType<typeof resolveFarmer>) {
  return useFarmer(farmerId, initialData);
}

export function useCreateFarmer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFarmerInput) => createFarmerFn({ data: input }),
    onSuccess: (farmer) => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      queryClient.setQueryData(["farmers", "detail", farmer.id], farmer);
    },
  });
}

export function useRequestEnrichment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { farmerId: string; gapIds?: DataGapId[] }) =>
      requestEnrichmentFn({ data: input }),
    onSuccess: (farmer) => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      queryClient.setQueryData(["farmers", "detail", farmer.id], farmer);
    },
  });
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
