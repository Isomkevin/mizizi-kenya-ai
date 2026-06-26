import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { useDashboard } from "@/api/hooks/use-dashboard";
import type { CountyIntel, MapMetric } from "@/api/types";
import { Button } from "@/components/ui/button";
import { riskColor } from "@/lib/risk";
import { cn } from "@/lib/utils";

const metrics: MapMetric[] = ["risk", "loanVolume", "climate", "approvalRate"];
const mapMetricLabels: Record<MapMetric, string> = {
  risk: "Risk level",
  loanVolume: "Loan volume",
  climate: "Climate exposure",
  approvalRate: "Approval rate",
};

function fillForCounty(countyIntel: CountyIntel[], county: CountyIntel, metric: MapMetric): string {
  if (metric === "risk") return riskColor(county.risk);

  const values = countyIntel.map((c) => metricValue(c, metric));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const v = metricValue(county, metric);
  const t = max === min ? 0.5 : (v - min) / (max - min);

  if (metric === "approvalRate") {
    const lightness = 0.35 + t * 0.35;
    return `oklch(${lightness} 0.09 155)`;
  }

  const lightness = 0.55 - t * 0.28;
  const chroma = 0.04 + t * 0.12;
  const hue = metric === "climate" ? 55 : 155;
  return `oklch(${lightness} ${chroma} ${hue})`;
}

export function KenyaMap() {
  const { data } = useDashboard();
  const countyIntel = data?.counties ?? [];
  const [metric, setMetric] = useState<MapMetric>("risk");
  const [selected, setSelected] = useState<CountyIntel | null>(countyIntel[2] ?? null);
  const legend = useMemo(() => {
    if (metric === "risk") {
      return ["Very low", "Low", "Medium", "High", "Critical"];
    }
    return ["Lower", "", "Higher"];
  }, [metric]);
  if (!countyIntel.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
            Geographic intelligence
          </div>
          <h2 className="font-display mt-1 text-2xl">Kenya portfolio map</h2>
        </div>
        <Link
          to="/app/analytics"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          County analytics <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {metrics.map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={metric === m ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setMetric(m)}
          >
            {mapMetricLabels[m]}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative rounded-xl border border-border bg-[color:var(--canvas)] p-4">
          <svg
            viewBox="0 0 180 200"
            className="mx-auto h-auto w-full max-w-md"
            role="img"
            aria-label="Schematic Kenya county map"
          >
            <path
              d="M 40 60 L 140 48 L 148 100 L 132 168 L 72 176 L 36 120 Z"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              opacity={0.6}
            />
            {countyIntel.map((county) => (
              <path
                key={county.id}
                d={county.path}
                fill={fillForCounty(countyIntel, county, metric)}
                stroke="var(--background)"
                strokeWidth="1.5"
                className={cn(
                  "cursor-pointer transition hover:opacity-90",
                  selected?.id === county.id && "stroke-primary stroke-[2.5]",
                )}
                onClick={() => setSelected(county)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelected(county);
                }}
                tabIndex={0}
                role="button"
                aria-label={`${county.name} county`}
              />
            ))}
          </svg>
          <div className="mt-2 flex justify-center gap-4 text-[10px] text-muted-foreground">
            {legend.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="space-y-4 rounded-xl border border-border bg-background p-4">
            <div>
              <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
                Selected county
              </div>
              <h3 className="font-display mt-1 text-xl">{selected.name}</h3>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Farmers" value={selected.farmers.toLocaleString()} />
              <Stat label="Cooperatives" value={String(selected.cooperatives)} />
              <Stat label="Applications" value={String(selected.applications)} />
              <Stat label="Loan volume" value={`KES ${selected.loanVolumeM}M`} />
              <Stat label="Approval rate" value={`${selected.approvalRate}%`} />
              <Stat label="Climate exposure" value={`${selected.climateExposure}%`} />
            </dl>
            <p className="text-xs text-muted-foreground">
              Zooming reveals cooperatives, farmers, and in-flight applications for this county —
              open geographic analytics for full drill-down.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            Select a county to inspect portfolio signals
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

function metricValue(county: CountyIntel, metric: MapMetric): number {
  switch (metric) {
    case "risk":
      return { "very-low": 1, low: 2, medium: 3, high: 4, critical: 5 }[county.risk] ?? 3;
    case "loanVolume":
      return county.loanVolumeM;
    case "climate":
      return county.climateExposure;
    case "approvalRate":
      return county.approvalRate;
  }
}
