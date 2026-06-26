type ClimatePoint = {
  county: string;
  lat: number;
  lon: number;
  fetchedAt: string;
  rainfallMm: number;
  temperatureC: number;
  windSpeedMs: number;
  droughtProbability: number;
  source: "open-meteo";
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const climateCache = new Map<string, { expiresAt: number; payload: ClimatePoint }>();

function cacheKey(county: string, lat: number, lon: number): string {
  return `${county.toLowerCase()}::${lat.toFixed(3)}::${lon.toFixed(3)}`;
}

export async function fetchClimateForCounty(
  county: string,
  lat: number,
  lon: number,
): Promise<ClimatePoint> {
  const key = cacheKey(county, lat, lon);
  const cached = climateCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,wind_speed_10m");
  url.searchParams.set("daily", "precipitation_sum");
  url.searchParams.set("timezone", "Africa/Nairobi");
  url.searchParams.set("forecast_days", "1");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const json = (await response.json()) as {
    current?: { temperature_2m?: number; wind_speed_10m?: number };
    daily?: { precipitation_sum?: number[] };
  };

  const rainfallMm = json.daily?.precipitation_sum?.[0] ?? 0;
  const temperatureC = json.current?.temperature_2m ?? 0;
  const windSpeedMs = json.current?.wind_speed_10m ?? 0;
  const droughtProbability = Number(Math.max(0, 1 - rainfallMm / 40).toFixed(2));

  const payload: ClimatePoint = {
    county,
    lat,
    lon,
    fetchedAt: new Date().toISOString(),
    rainfallMm,
    temperatureC,
    windSpeedMs,
    droughtProbability,
    source: "open-meteo",
  };

  climateCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
  return payload;
}
