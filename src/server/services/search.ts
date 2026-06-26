import type { FarmerProfile, SearchResult } from "@/api/types";
import { getPersistence } from "@/server/services/persistence";

export type GlobalSearchInput = {
  query: string;
  type?: SearchResult["type"];
  limit?: number;
};

function matchesText(entry: SearchResult, query: string): boolean {
  const q = query.toLowerCase();
  return (
    entry.title.toLowerCase().includes(q) ||
    entry.subtitle.toLowerCase().includes(q) ||
    entry.location.toLowerCase().includes(q) ||
    entry.id.toLowerCase().includes(q)
  );
}

export async function globalSearch(input: GlobalSearchInput): Promise<SearchResult[]> {
  const db = await getPersistence().getDb();
  const query = input.query.trim();
  if (!query) return [];
  return db.searchIndex
    .filter((entry) => (input.type ? entry.type === input.type : true))
    .filter((entry) => matchesText(entry, query))
    .slice(0, input.limit ?? 15);
}

function toSearchResult(farmer: FarmerProfile): SearchResult {
  return {
    id: farmer.id,
    type: "farmer",
    title: farmer.name,
    subtitle: `${farmer.cropType} · ${farmer.parcelHa ?? 0} ha`,
    location: farmer.county,
    status: farmer.decisionStatus,
    risk: farmer.risk,
    href: `/app/farmers/${farmer.id}`,
    recentActivity: farmer.timeline[0]?.title,
  };
}

export async function searchFarmerResults(query: string, limit = 15): Promise<SearchResult[]> {
  const farmers = await getPersistence().listFarmers();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return farmers
    .filter(
      (farmer) =>
        farmer.id.toLowerCase().includes(q) ||
        farmer.farmerId.toLowerCase().includes(q) ||
        farmer.name.toLowerCase().includes(q) ||
        farmer.cooperative.toLowerCase().includes(q),
    )
    .map(toSearchResult)
    .slice(0, limit);
}
