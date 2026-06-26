import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/climate")({
  beforeLoad: () => {
    throw redirect({ to: "/app/analytics", search: { tab: "climate" } });
  },
});
