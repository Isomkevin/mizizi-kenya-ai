import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPanel } from "@/components/app/PlaceholderPanel";

export const Route = createFileRoute("/app/portfolio")({
  component: () => (
    <PlaceholderPanel
      title="Portfolio"
      description="Lending portfolio composition, risk concentration and cohort performance."
    />
  ),
});
