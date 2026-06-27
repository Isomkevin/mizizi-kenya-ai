import { Link } from "@tanstack/react-router";

import type { DecisionDetail } from "@/api/types";
import { RiskBadge } from "@/components/app/RiskBadge";

export function DecisionSummary({ decision }: { decision: DecisionDetail }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
            Decision workspace
          </p>
          <h2 className="font-display text-2xl">Decision summary</h2>
        </div>
        <Link
          to="/app/farmers/$farmerId"
          params={{ farmerId: decision.farmerId }}
          search={{ tab: "overview" }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm transition hover:border-primary/30 hover:bg-accent/20"
        >
          <span className="font-medium">{decision.farmerName}</span>
          <span className="mt-0.5 block font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
            {decision.farmerId}
          </span>
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-border bg-background px-2 py-1 text-xs">
          {decision.applicationId}
        </span>
        <span className="rounded-md border border-border bg-background px-2 py-1 text-xs">
          {decision.status}
        </span>
        <RiskBadge level={decision.risk} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Recommendation: <strong>{decision.recommendation}</strong> · Confidence{" "}
        {(decision.confidence * 100).toFixed(0)}%
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{decision.farmerExplanation}</p>
    </section>
  );
}
