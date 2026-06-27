import { Link } from "@tanstack/react-router";
import { Network } from "lucide-react";

import type { DecisionDetail } from "@/api/types";
import { Button } from "@/components/ui/button";

export function GraphPathViewer({ decision }: { decision: DecisionDetail }) {
  const paths = decision.factors.flatMap((factor) => {
    if (factor.graphEvidence?.length) {
      return [
        {
          key: `${factor.id}-evidence`,
          factorLabel: factor.label,
          step: factor.graphEvidence
            .map((entry, index) =>
              index === 0
                ? `${entry.type}: ${entry.label}`
                : `→ [${entry.relationship ?? "LINKED"}] ${entry.type}: ${entry.label}`,
            )
            .join(" "),
          verified: true,
        },
      ];
    }

    return (factor.graphPath ?? []).map((step, index) => ({
      key: `${factor.id}-${step}-${index}`,
      factorLabel: factor.label,
      step,
      verified: false,
    }));
  });

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
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{path.factorLabel}</span>
                {path.verified ? (
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Verified
                  </span>
                ) : null}
              </div>
              <div className="mt-1 font-mono-data text-xs text-foreground/85">{path.step}</div>
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
