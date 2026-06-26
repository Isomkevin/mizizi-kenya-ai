import { useState } from "react";
import {
  Activity,
  ChevronDown,
  CloudSun,
  GitBranch,
  MessageSquare,
  Shield,
  UserCheck,
} from "lucide-react";

import { useDashboard } from "@/api/hooks/use-dashboard";
import type { ActivityItem, ActivityType } from "@/api/types";
import { RiskBadge } from "@/components/app/RiskBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const typeMeta: Record<ActivityType, { label: string; icon: typeof Activity }> = {
  "loan-approved": { label: "Loan approved", icon: UserCheck },
  "graph-updated": { label: "Graph updated", icon: GitBranch },
  "climate-refresh": { label: "Climate refresh", icon: CloudSun },
  "sms-delivered": { label: "SMS delivered", icon: MessageSquare },
  "explanation-generated": { label: "Explanation generated", icon: Shield },
  "officer-override": { label: "Officer override", icon: Activity },
};

export function RecentActivityFeed() {
  const { data } = useDashboard();
  const recentActivity = data?.activity ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
          Recent activity
        </div>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {recentActivity.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const [open, setOpen] = useState(false);
  const meta = typeMeta[item.type];
  const Icon = meta.icon;

  return (
    <li className="py-3">
      <div className="flex items-start gap-3 text-sm">
        <span className="font-mono-data mt-0.5 w-12 shrink-0 text-xs text-muted-foreground">
          {item.timestamp}
        </span>
        <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-muted">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{meta.label}</span>
            <RiskBadge level={item.risk} />
          </div>
          <p className="mt-0.5 text-muted-foreground">{item.message}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>Actor · {item.actor}</span>
            {item.confidence != null ? (
              <span className="font-mono-data">Confidence · {item.confidence.toFixed(2)}</span>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 gap-1 text-xs"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Details
          <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
        </Button>
      </div>
      {open ? (
        <div className="ml-[4.75rem] mt-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
          Full audit trail and linked entities open from the farmer or decision workspace.
        </div>
      ) : null}
    </li>
  );
}
