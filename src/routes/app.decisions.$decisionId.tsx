import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { useDecision } from "@/api/hooks/use-decisions";
import { ContributingFactors } from "@/components/app/decisions/ContributingFactors";
import { DecisionSummary } from "@/components/app/decisions/DecisionSummary";
import { GraphPathViewer } from "@/components/app/decisions/GraphPathViewer";
import { OfficerDecisionPanel } from "@/components/app/decisions/OfficerDecisionPanel";

export const Route = createFileRoute("/app/decisions/$decisionId")({
  head: () => ({
    meta: [{ title: "Mizizi · Decision Workspace" }],
  }),
  component: DecisionWorkspacePage,
});

function DecisionWorkspacePage() {
  const { decisionId } = Route.useParams();
  const { data: decision } = useDecision(decisionId);

  if (!decision) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        Decision not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <Link
        to="/app/decisions"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to decisions queue
      </Link>

      <DecisionSummary decision={decision} />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <ContributingFactors decision={decision} />
        <OfficerDecisionPanel decision={decision} />
      </div>
      <GraphPathViewer decision={decision} />
    </div>
  );
}
