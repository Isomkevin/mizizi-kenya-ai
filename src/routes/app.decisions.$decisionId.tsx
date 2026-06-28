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
import { findDemoDecision } from "@/lib/demo-seed";

export const Route = createFileRoute("/app/decisions/$decisionId")({
  loader: ({ params }) => ({
    decision: findDemoDecision(params.decisionId),
  }),
  head: () => ({
    meta: [{ title: "Mizizi · Application Review" }],
  }),
  component: DecisionWorkspacePage,
});

function DecisionWorkspacePage() {
  const { decisionId } = Route.useParams();
  const { decision: seededDecision } = Route.useLoaderData();
  const { data: decision, isFetching, isError } = useDecision(decisionId, seededDecision);
  const resolvedDecision = decision ?? seededDecision;
  const { data: farmer } = useFarmerProfile(resolvedDecision?.farmerId ?? "");

  if (!resolvedDecision && isFetching) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        Loading application review…
      </div>
    );
  }

  if (isError || !resolvedDecision) {
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

      <DecisionSummary decision={resolvedDecision} />
      {farmer &&
      (farmer.insufficientData ||
        (farmer.dataGaps?.some((g) => g.status === "missing") ?? false)) ? (
        <FarmerDataGapsPanel farmer={farmer} variant="compact" />
      ) : null}
      <DecisionContextLinks decision={resolvedDecision} />
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <ContributingFactors decision={resolvedDecision} />
        <OfficerDecisionPanel decision={resolvedDecision} />
      </div>
      <GraphPathViewer decision={resolvedDecision} />
    </div>
  );
}
