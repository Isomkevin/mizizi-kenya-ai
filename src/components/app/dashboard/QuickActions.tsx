import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CloudSun,
  FileDown,
  Network,
  Sparkles,
  UserPlus,
  ClipboardList,
} from "lucide-react";

import { useDashboard } from "@/api/hooks/use-dashboard";

const actionIcons = {
  "qa-1": UserPlus,
  "qa-2": Network,
  "qa-3": Sparkles,
  "qa-4": CloudSun,
  "qa-5": FileDown,
  "qa-6": ClipboardList,
} as const;

export function QuickActions() {
  const { data } = useDashboard();
  const quickActions = data?.quickActions ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
        Quick actions
      </div>
      <h2 className="font-display mt-1 text-xl">What should you do next?</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = actionIcons[action.id as keyof typeof actionIcons] ?? ArrowRight;
          return (
            <Link
              key={action.id}
              to={action.href}
              className="group flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-accent/20"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium">{action.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{action.description}</div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
