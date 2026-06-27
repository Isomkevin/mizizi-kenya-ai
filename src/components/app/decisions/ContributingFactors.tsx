import type { DecisionDetail } from "@/api/types";

function formatEvidencePath(factor: DecisionDetail["factors"][number]): string | null {
  if (factor.graphEvidence?.length) {
    return factor.graphEvidence
      .map((step, index) =>
        index === 0
          ? `${step.type}: ${step.label}`
          : `→ [${step.relationship ?? "LINKED"}] ${step.type}: ${step.label}`,
      )
      .join(" ");
  }
  if (factor.graphPath?.length) {
    return factor.graphPath.join(" → ");
  }
  return null;
}

export function ContributingFactors({ decision }: { decision: DecisionDetail }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-2xl">Contributing factors</h2>
      <div className="mt-3 space-y-2">
        {decision.factors.map((factor) => {
          const evidencePath = formatEvidencePath(factor);
          return (
            <div key={factor.id} className="rounded-md border border-border bg-background p-3">
              <div className="font-medium">
                {factor.label} · {factor.direction}
              </div>
              <div className="text-sm text-muted-foreground">
                Weight {(factor.weight * 100).toFixed(0)}% · Confidence{" "}
                {(factor.confidence * 100).toFixed(0)}% · Source {factor.source}
              </div>
              {evidencePath ? (
                <div className="mt-2 font-mono-data text-xs text-foreground/80">{evidencePath}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
