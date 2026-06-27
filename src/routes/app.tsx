import { useCallback, useState } from "react";
import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";

import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar } from "@/components/app/AppSidebar";
import { GlobalSearch, useGlobalSearchShortcut } from "@/components/app/GlobalSearch";
import { getAuthSessionSnapshot } from "@/providers/AuthProvider";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    const session = getAuthSessionSnapshot();
    if (!session) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Mizizi · Platform" },
      {
        name: "description",
        content: "The Mizizi connected intelligence workspace for agricultural finance.",
      },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  useGlobalSearchShortcut(openSearch);

  return (
    <div className="grid min-h-screen w-full bg-canvas lg:grid-cols-[260px_1fr]">
      <AppSidebar onSearchOpen={openSearch} />
      <div className="flex min-h-screen flex-col">
        <AppHeader pathname={pathname} onSearchOpen={openSearch} />
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
