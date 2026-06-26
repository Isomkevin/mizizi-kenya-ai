import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/portfolio")({
  beforeLoad: () => {
    throw redirect({ to: "/app/analytics", search: { tab: "lending" } });
  },
});
