import { CloudSun, Sparkles } from "lucide-react";

import { welcomeSnapshot } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

const healthStyles = {
  healthy: "text-[color:var(--moss)]",
  watch: "text-[color:var(--amber)]",
  critical: "text-[color:var(--crimson)]",
} as const;

export function DashboardWelcome() {
  const w = welcomeSnapshot;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
          {w.greeting}
        </div>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          {w.subtitle}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{w.summary}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SnapshotCard
          icon={CloudSun}
          label="Weather insight"
          value={w.weatherInsight}
        />
        <SnapshotCard
          label="Pending approvals"
          value={`${w.pendingApprovals} applications`}
          highlight
        />
        <SnapshotCard
          label="Portfolio health"
          value={w.portfolioHealth}
          valueClassName={healthStyles[w.portfolioHealth]}
        />
        <SnapshotCard
          icon={Sparkles}
          label="AI jobs today"
          value={`${w.aiJobsToday} completed · ${w.recentAlerts} alerts`}
        />
      </div>
    </section>
  );
}

function SnapshotCard({
  icon: Icon,
  label,
  value,
  highlight,
  valueClassName,
}: {
  icon?: typeof CloudSun;
  label: string;
  value: string;
  highlight?: boolean;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition hover:border-primary/20",
        highlight && "border-primary/20 bg-primary/[0.03]",
      )}
    >
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : null}
        <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
      </div>
      <div
        className={cn(
          "mt-2 text-sm font-medium capitalize leading-snug",
          valueClassName,
        )}
      >
        {value}
      </div>
    </div>
  );
}
