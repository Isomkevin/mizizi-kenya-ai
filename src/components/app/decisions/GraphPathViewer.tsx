import type { DecisionDetail } from "@/api/types";

export function GraphPathViewer({ decision }: { decision: DecisionDetail }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-2xl">Graph path viewer</h2>
      <ul className="mt-3 space-y-2">
        {decision.factors.flatMap((factor) =>
          (factor.graphPath ?? []).map((step, index) => (
            <li
              key={`${factor.id}-${step}-${index}`}
              className="rounded-md border border-border bg-background p-3 text-sm"
            >
              <span className="font-medium">{factor.label}</span> · {step}
            </li>
          )),
        )}
      </ul>
    </section>
  );
}
