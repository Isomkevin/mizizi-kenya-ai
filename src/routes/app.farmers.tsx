import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPanel } from "@/components/app/PlaceholderPanel";

export const Route = createFileRoute("/app/farmers")({
  component: () => (
    <PlaceholderPanel
      title="Farmer intelligence"
      description="Search, resolve identities and inspect the complete signal picture for any farmer in your portfolio."
    />
  ),
});
