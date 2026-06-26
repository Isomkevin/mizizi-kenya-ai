import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { useDecisions } from "@/api/hooks/use-decisions";
import { RiskBadge } from "@/components/app/RiskBadge";

export const Route = createFileRoute("/app/decisions")({
  head: () => ({
    meta: [{ title: "Mizizi · Decisions" }],
  }),
  component: DecisionsQueuePage,
});

function DecisionsQueuePage() {
  const { data: decisions = [] } = useDecisions();
  const pending = decisions.filter((decision) => decision.status === "pending");

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <section className="space-y-2">
        <p className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
          Explainability workspace
        </p>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">Pending Decisions Queue</h1>
      </section>

      <div className="space-y-3">
        {pending.map((decision) => (
          <Link
            key={decision.id}
            to="/app/decisions/$decisionId"
            params={{ decisionId: decision.id }}
            className="block rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:bg-accent/20"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold">{decision.farmerName}</h3>
                <p className="font-mono-data text-[11px] uppercase tracking-wider text-muted-foreground">
                  {decision.applicationId} · {decision.recommendation}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confidence {(decision.confidence * 100).toFixed(0)}% · Created{" "}
                  {new Date(decision.createdAt).toLocaleDateString()}
                </p>
              </div>
              <RiskBadge level={decision.risk} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
