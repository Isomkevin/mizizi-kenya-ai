import { Link } from "@tanstack/react-router";
import { ArrowUpRight, TrendingDown, TrendingUp, Minus } from "lucide-react";

import { dashboardKpis } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: "text-[color:var(--moss)]",
  down: "text-[color:var(--moss)]",
  neutral: "text-muted-foreground",
};

export function KpiGrid() {
  return (
    <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
      {dashboardKpis.map((kpi) => {
        const TrendIcon = trendIcons[kpi.trend];
        const inner = (
          <>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
            <div className="font-display mt-2 text-2xl transition group-hover:translate-y-[-1px] md:text-3xl">
              {kpi.value}
            </div>
            <div
              className={cn(
                "mt-2 flex items-center gap-1 font-mono-data text-[11px] uppercase tracking-widest",
                trendColors[kpi.trend],
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {kpi.delta}
            </div>
            {kpi.href ? (
              <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground opacity-0 transition group-hover:opacity-100">
                Drill down <ArrowUpRight className="h-3 w-3" />
              </div>
            ) : null}
          </>
        );

        if (kpi.href) {
          return (
            <Link
              key={kpi.id}
              to={kpi.href}
              className="group bg-card p-5 transition hover:bg-accent/30"
            >
              {inner}
            </Link>
          );
        }

        return (
          <div key={kpi.id} className="group bg-card p-5">
            {inner}
          </div>
        );
      })}
    </section>
  );
}
