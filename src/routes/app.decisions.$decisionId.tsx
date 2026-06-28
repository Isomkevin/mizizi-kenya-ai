import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { useDecision } from "@/api/hooks/use-decisions";
import { useFarmerProfile } from "@/api/hooks/use-farmers";
import { ContributingFactors } from "@/components/app/decisions/ContributingFactors";
import { DecisionContextLinks } from "@/components/app/decisions/DecisionContextLinks";
import { DecisionSummary } from "@/components/app/decisions/DecisionSummary";
import { GraphPathViewer } from "@/components/app/decisions/GraphPathViewer";
import { OfficerDecisionPanel } from "@/components/app/decisions/OfficerDecisionPanel";
import { FarmerDataGapsPanel } from "@/components/app/farmers/FarmerDataGapsPanel";

export const Route = createFileRoute("/app/decisions/$decisionId")({
  head: () => ({
    meta: [{ title: "Mizizi · Application Review" }],
  }),
  component: DecisionWorkspacePage,
});

function DecisionWorkspacePage() {
  const { decisionId } = Route.useParams();
  const { data: decision, isLoading, isError } = useDecision(decisionId);
  const { data: farmer } = useFarmerProfile(decision?.farmerId ?? "");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        Loading application review…
      </div>
    );
  }

  if (isError || !decision) {
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
        Back to applications queue
      </Link>

      <DecisionSummary decision={decision} />
      {farmer &&
      (farmer.insufficientData ||
        (farmer.dataGaps?.some((g) => g.status === "missing") ?? false)) ? (
        <FarmerDataGapsPanel farmer={farmer} variant="compact" />
      ) : null}
      <DecisionContextLinks decision={decision} />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <ContributingFactors decision={decision} />
        <OfficerDecisionPanel decision={decision} />
      </div>
      <GraphPathViewer decision={decision} />
    </div>
  );
}
