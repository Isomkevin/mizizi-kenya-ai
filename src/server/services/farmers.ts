import type { FarmerProfile } from "@/api/types";
import { getPersistence } from "@/server/services/persistence";

export type FarmerSearchInput = {
  query?: string;
  county?: string;
  risk?: FarmerProfile["risk"];
  limit?: number;
};

export async function searchFarmers(input: FarmerSearchInput = {}): Promise<FarmerProfile[]> {
  const farmers = await getPersistence().listFarmers();
  const query = input.query?.trim().toLowerCase();
  const county = input.county?.trim().toLowerCase();

  return farmers
    .filter((farmer) => {
      if (input.risk && farmer.risk !== input.risk) return false;
      if (county && farmer.county.toLowerCase() !== county) return false;
      if (!query) return true;
      return (
        farmer.name.toLowerCase().includes(query) ||
        farmer.farmerId.toLowerCase().includes(query) ||
        farmer.cooperative.toLowerCase().includes(query)
      );
    })
    .slice(0, input.limit ?? 30);
}

export async function getFarmer(id: string): Promise<FarmerProfile | null> {
  const farmer = await getPersistence().getFarmerById(id);
  return farmer ?? null;
}
