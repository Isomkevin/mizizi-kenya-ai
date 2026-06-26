import type { AnalyticsPayload } from "@/api/types";
import { fetchClimateForCounty } from "@/server/services/climate";
import { getPersistence } from "@/server/services/persistence";

export type RefreshClimateInput = {
  county: string;
  lat: number;
  lon: number;
};

export async function getAnalytics(): Promise<AnalyticsPayload> {
  const db = await getPersistence().getDb();
  return db.analytics;
}

export async function refreshClimate(input: RefreshClimateInput): Promise<{
  county: string;
  rainfallMm: number;
  droughtProbability: number;
  fetchedAt: string;
}> {
  const persistence = getPersistence();
  const db = await persistence.getDb();
  const climate = await fetchClimateForCounty(input.county, input.lat, input.lon);

  db.analytics.climate = db.analytics.climate.map((item) =>
    item.county.toLowerCase() === input.county.toLowerCase()
      ? {
          ...item,
          rainfall: climate.rainfallMm,
          drought: Math.round(climate.droughtProbability * 100),
        }
      : item,
  );

  db.farmers = db.farmers.map((farmer) =>
    farmer.county.toLowerCase() === input.county.toLowerCase()
      ? {
          ...farmer,
          climate: {
            ...farmer.climate,
            rainfallMm: climate.rainfallMm,
            droughtProbability: climate.droughtProbability,
            insight: `Updated from Open-Meteo at ${new Date(climate.fetchedAt).toLocaleTimeString()}.`,
          },
        }
      : farmer,
  );

  await persistence.saveDb(db);

  return {
    county: climate.county,
    rainfallMm: climate.rainfallMm,
    droughtProbability: climate.droughtProbability,
    fetchedAt: climate.fetchedAt,
  };
}
