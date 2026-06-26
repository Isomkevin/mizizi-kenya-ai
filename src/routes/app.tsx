import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CloudSun,
  FileText,
  LayoutDashboard,
  Network,
  Search,
  Sprout,
  Users,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Mizizi · Platform" },
      {
        name: "description",
        content:
          "The Mizizi connected intelligence workspace for agricultural finance.",
      },
    ],
  }),
  component: AppLayout,
});

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/farmers", label: "Farmer intelligence", icon: Users },
  { to: "/app/graph", label: "Graph workspace", icon: Network },
  { to: "/app/decisions", label: "Decisions", icon: FileText },
  { to: "/app/portfolio", label: "Portfolio", icon: Wallet },
  { to: "/app/climate", label: "Climate", icon: CloudSun },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
];

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="grid min-h-screen w-full bg-canvas lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sprout className="h-4 w-4" />
            </span>
            <span className="font-display text-xl leading-none">Mizizi</span>
          </Link>
        </div>
        <div className="px-3 pt-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span>Search farmers, decisions…</span>
            <kbd className="ml-auto font-mono-data text-[10px] text-muted-foreground/80">
              ⌘K
            </kbd>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-0.5 px-2">
          {nav.map((item) => {
            const active = item.end
              ? pathname === item.to
              : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                ].join(" ")}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
              Tenant
            </div>
            <div className="mt-1 text-sm font-medium">LESOM Dynamics</div>
            <div className="text-xs text-muted-foreground">Sandbox · v1.0</div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/70 px-6 backdrop-blur">
          <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
            {currentLabel(pathname)}
          </div>
          <Link
            to="/"
            className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← Landing
          </Link>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function currentLabel(pathname: string) {
  const match = nav
    .slice()
    .sort((a, b) => b.to.length - a.to.length)
    .find((n) => (n.to === "/app" ? pathname === "/app" : pathname.startsWith(n.to)));
  return match?.label ?? "Mizizi";
}
