import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPanel } from "@/components/app/PlaceholderPanel";

export const Route = createFileRoute("/app/analytics")({
  component: () => (
    <PlaceholderPanel
      title="Analytics platform"
      description="Executive, lending, geographic, climate, graph and explainability analytics."
    />
  ),
});
