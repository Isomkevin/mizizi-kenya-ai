import { useEffect, useMemo, useState } from "react";

interface CountyFeature {
  type: "Feature";
  properties: { id: string; name: string; score: number };
  geometry: { type: "Polygon"; coordinates: number[][][] };
}

interface FeatureCollection {
  type: "FeatureCollection";
  features: CountyFeature[];
}

function colorFor(value: number) {
  const clamped = Math.max(0, Math.min(1, value));
  const lightness = 0.84 - clamped * 0.42;
  const chroma = 0.06 + clamped * 0.08;
  return `oklch(${lightness} ${chroma} 150)`;
}

export function AnalyticsMap() {
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [activeCounty, setActiveCounty] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL("../../../assets/geo/kenya-counties.json", import.meta.url);
    void fetch(url.href)
      .then((response) => response.json() as Promise<FeatureCollection>)
      .then(setGeo);
  }, []);

  const bounds = useMemo(() => {
    if (!geo) return null;
    const lons = geo.features.flatMap((feature) =>
      feature.geometry.coordinates[0].map((point) => point[0]),
    );
    const lats = geo.features.flatMap((feature) =>
      feature.geometry.coordinates[0].map((point) => point[1]),
    );
    return {
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  }, [geo]);

  if (!geo || !bounds) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        Loading county map...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-2xl">Geographic risk choropleth</h3>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px]">
        <svg
          viewBox="0 0 1000 620"
          className="w-full rounded-lg border border-border bg-background p-3"
        >
          {geo.features.map((feature) => {
            const points = feature.geometry.coordinates[0]
              .map(([lon, lat]) => {
                const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon || 1)) * 900 + 40;
                const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat || 1)) * 520 + 40;
                return `${x},${y}`;
              })
              .join(" ");

            const active = activeCounty === feature.properties.id;
            return (
              <polygon
                key={feature.properties.id}
                points={points}
                fill={colorFor(feature.properties.score)}
                stroke={active ? "var(--primary)" : "var(--border)"}
                strokeWidth={active ? 4 : 2}
                onMouseEnter={() => setActiveCounty(feature.properties.id)}
                onMouseLeave={() => setActiveCounty(null)}
              />
            );
          })}
        </svg>

        <div className="space-y-2 text-sm">
          {geo.features.map((feature) => (
            <div
              key={feature.properties.id}
              className="rounded-md border border-border bg-background p-2.5"
              onMouseEnter={() => setActiveCounty(feature.properties.id)}
              onMouseLeave={() => setActiveCounty(null)}
            >
              <div className="font-medium">{feature.properties.name}</div>
              <div className="text-muted-foreground">
                Risk score {(feature.properties.score * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
