/** Approximate county centroids for Open-Meteo climate refresh. */
export const KENYA_COUNTY_COORDS: Record<string, { lat: number; lon: number }> = {
  Kiambu: { lat: -1.0314, lon: 36.8699 },
  Kisumu: { lat: -0.0917, lon: 34.768 },
  Nyandarua: { lat: -0.177, lon: 36.548 },
  Machakos: { lat: -1.5177, lon: 37.2634 },
  Kakamega: { lat: 0.2827, lon: 34.7519 },
  "Uasin Gishu": { lat: 0.5143, lon: 35.2698 },
  Meru: { lat: 0.0469, lon: 37.6559 },
  Makueni: { lat: -1.8067, lon: 37.6261 },
  "Trans Nzoia": { lat: 1.0567, lon: 35.0033 },
  Nakuru: { lat: -0.3031, lon: 36.08 },
  Kirinyaga: { lat: -0.5095, lon: 37.2802 },
  Mombasa: { lat: -4.0435, lon: 39.6682 },
};

export function countyCoordinates(county: string): { lat: number; lon: number } {
  return KENYA_COUNTY_COORDS[county] ?? { lat: -1.2864, lon: 36.8172 };
}
