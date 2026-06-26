import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPanel } from "@/components/app/PlaceholderPanel";

export const Route = createFileRoute("/app/decisions")({
  component: () => (
    <PlaceholderPanel
      title="Decision workspace"
      description="Explainable approvals with contributing factors, positive and negative signals, and full audit trail."
    />
  ),
});
