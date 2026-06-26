import { Link, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { appNav, MiziziLogo } from "@/components/app/nav";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onSearchOpen: () => void;
}

export function AppSidebar({ onSearchOpen }: AppSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden border-r border-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <MiziziLogo className="flex items-center gap-2" />
      </div>

      <div className="px-3 pt-4">
        <button
          type="button"
          onClick={onSearchOpen}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Search farmers, decisions…</span>
          <kbd className="ml-auto font-mono-data text-[10px] text-muted-foreground/80">⌘K</kbd>
        </button>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 px-2">
        {appNav.map((item) => {
          const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <StatusPill label="Neo4j" status="connected" />
          <StatusPill label="API" status="healthy" />
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
            Tenant
          </div>
          <div className="mt-1 text-sm font-medium">LESOM Dynamics</div>
          <div className="text-xs text-muted-foreground">Sandbox · v1.0</div>
        </div>
      </div>
    </aside>
  );
}

function StatusPill({ label, status }: { label: string; status: "connected" | "healthy" }) {
  return (
    <div className="rounded-md border border-border bg-background px-2 py-1.5">
      <div className="font-mono-data uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--moss)]" />
        <span className="capitalize">{status}</span>
      </div>
    </div>
  );
}
