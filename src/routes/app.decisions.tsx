import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/decisions")({
  component: DecisionsLayout,
});

function DecisionsLayout() {
  return <Outlet />;
}
