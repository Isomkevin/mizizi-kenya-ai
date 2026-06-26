import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPanel } from "@/components/app/PlaceholderPanel";

export const Route = createFileRoute("/app/graph")({
  component: () => (
    <PlaceholderPanel
      title="Graph intelligence workspace"
      description="Interactive force-directed canvas of farmers, cooperatives, peers, climate and financial relationships."
    />
  ),
});
