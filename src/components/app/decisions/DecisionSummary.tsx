import type { DecisionDetail } from "@/api/types";
import { RiskBadge } from "@/components/app/RiskBadge";

export function DecisionSummary({ decision }: { decision: DecisionDetail }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-2xl">Decision summary</h2>
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
