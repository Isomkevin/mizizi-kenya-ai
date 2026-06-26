import { Link } from "@tanstack/react-router";

import type { FarmerProfile } from "@/api/types";
import { RiskBadge } from "@/components/app/RiskBadge";

export function FarmerDecisionsTab({ farmer }: { farmer: FarmerProfile }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-xl">Decisions</h3>
      <div className="mt-3 space-y-2">
        {farmer.decisions.map((decision) => (
          <div key={decision.id} className="rounded-md border border-border bg-background p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">
                {decision.applicationId} · {decision.recommendation}
              </div>
              <RiskBadge level={decision.risk} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Confidence {(decision.confidence * 100).toFixed(0)}% · {decision.status} ·{" "}
              {decision.createdAt}
            </div>
            <Link
              to="/app/decisions/$decisionId"
              params={{ decisionId: decision.id }}
              className="mt-2 inline-flex text-xs text-primary hover:underline"
            >
              Open decision workspace
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
