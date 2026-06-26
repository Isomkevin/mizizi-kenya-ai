import { Link } from "@tanstack/react-router";
import { ArrowRight, Network, UserRound } from "lucide-react";

import type { FarmerSummary } from "@/api/types";
import { RiskBadge } from "@/components/app/RiskBadge";

export function FarmerResultCard({ farmer }: { farmer: FarmerSummary }) {
  return (
    <Link
      to="/app/farmers/$farmerId"
      params={{ farmerId: farmer.id }}
      className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:bg-accent/20"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">{farmer.name}</h3>
            <p className="font-mono-data text-[11px] uppercase tracking-wider text-muted-foreground">
              {farmer.farmerId}
            </p>
            <p className="text-sm text-muted-foreground">
              {farmer.cooperative} · {farmer.county}
            </p>
          </div>
        </div>
        <RiskBadge level={farmer.risk} />
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Crop" value={farmer.cropType} />
        <Metric label="Decision" value={farmer.decisionStatus} />
        <Metric label="Confidence" value={`${Math.round(farmer.confidence * 100)}%`} />
        <Metric label="Climate" value={farmer.climateIndicator} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Network className="h-3.5 w-3.5" />
          {farmer.graphConnections} graph connections
        </span>
        <span className="inline-flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          Open profile <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
