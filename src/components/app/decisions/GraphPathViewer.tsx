import { Link } from "@tanstack/react-router";
import { Network } from "lucide-react";

import type { DecisionDetail } from "@/api/types";
import { Button } from "@/components/ui/button";

export function GraphPathViewer({ decision }: { decision: DecisionDetail }) {
  const paths = decision.factors.flatMap((factor) =>
    (factor.graphPath ?? []).map((step, index) => ({
      key: `${factor.id}-${step}-${index}`,
      factorLabel: factor.label,
      step,
    })),
  );

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Graph path viewer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Evidence paths traced through the farmer&apos;s graph neighbourhood.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/app/graph" search={{ farmerId: decision.farmerId }}>
            <Network className="h-4 w-4" />
            Open graph workspace
          </Link>
        </Button>
      </div>
      <ul className="mt-3 space-y-2">
        {paths.length ? (
          paths.map((path) => (
            <li
              key={path.key}
              className="rounded-md border border-border bg-background p-3 text-sm"
            >
              <span className="font-medium">{path.factorLabel}</span> · {path.step}
            </li>
          ))
        ) : (
          <li className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            No graph paths recorded for this decision yet.{" "}
            <Link
              to="/app/graph"
              search={{ farmerId: decision.farmerId }}
              className="text-primary hover:underline"
            >
              Inspect the farmer graph
            </Link>
            .
          </li>
        )}
      </ul>
    </section>
  );
}
