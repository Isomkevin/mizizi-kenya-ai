import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPanel } from "@/components/app/PlaceholderPanel";

export const Route = createFileRoute("/app/climate")({
  component: () => (
    <PlaceholderPanel
      title="Climate intelligence"
      description="Rainfall variance, yield risk and climate buffer recommendations across cooperatives."
    />
  ),
});
