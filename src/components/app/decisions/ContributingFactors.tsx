import type { DecisionDetail } from "@/api/types";
import {
  formatFactorDirection,
  formatFactorInfluence,
  formatFactorSource,
} from "@/lib/risk-display";

export function ContributingFactors({ decision }: { decision: DecisionDetail }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-2xl">Why Mizizi recommends this</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Key risk drivers behind the recommendation. The officer makes the final decision.
      </p>
      <div className="mt-3 space-y-2">
        {decision.factors.map((factor) => (
          <div key={factor.id} className="rounded-md border border-border bg-background p-3">
            <div className="font-medium">
              {factor.label} — {formatFactorDirection(factor.direction)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatFactorInfluence(factor.weight)} · Based on {formatFactorSource(factor.source)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
