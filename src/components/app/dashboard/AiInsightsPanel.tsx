import { CloudSun, Copy, Network, ShieldCheck, Sparkles } from "lucide-react";

import { dashboardInsights } from "@/lib/mock/dashboard";
import type { DashboardInsight } from "@/lib/mock/dashboard";
import { RiskBadge } from "@/components/app/RiskBadge";

const iconMap = {
  climate: CloudSun,
  graph: Network,
  shield: ShieldCheck,
  duplicate: Copy,
} as const;

export function AiInsightsPanel() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
          AI insights · today
        </div>
      </div>
      <ul className="mt-4 space-y-4">
        {dashboardInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </ul>
    </div>
  );
}

function InsightCard({ insight }: { insight: DashboardInsight }) {
  const Icon = iconMap[insight.icon];
  return (
    <li className="rounded-xl border border-border bg-background p-4 transition hover:border-primary/20">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-medium">{insight.title}</div>
            <RiskBadge level={insight.severity} />
          </div>
          <div className="text-xs text-muted-foreground">{insight.body}</div>
          <div className="rounded-md bg-muted/50 px-2.5 py-2 text-xs">
            <span className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
              Why ·{" "}
            </span>
            {insight.why}
          </div>
        </div>
      </div>
    </li>
  );
}
