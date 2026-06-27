import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/farmers")({
  component: FarmersLayout,
});

function FarmersLayout() {
  return <Outlet />;
}
