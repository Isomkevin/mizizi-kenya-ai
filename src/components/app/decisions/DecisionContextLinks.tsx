import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CloudSun,
  FileText,
  Network,
  ScrollText,
  UserRound,
} from "lucide-react";

import type { DecisionDetail } from "@/api/types";

interface ContextLink {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  icon: typeof UserRound;
  label: string;
  description: string;
}

export function DecisionContextLinks({ decision }: { decision: DecisionDetail }) {
  const links: ContextLink[] = [
    {
      to: "/app/farmers/$farmerId",
      params: { farmerId: decision.farmerId },
      search: { tab: "overview" },
      icon: UserRound,
      label: "Borrower profile",
      description: decision.farmerName,
    },
    {
      to: "/app/graph",
      search: { farmerId: decision.farmerId },
      icon: Network,
      label: "Connection map",
      description: "Cooperatives, suppliers, and linked accounts",
    },
    {
      to: "/app/farmers/$farmerId",
      params: { farmerId: decision.farmerId },
      search: { tab: "applications" },
      icon: ScrollText,
      label: "Application details",
      description: decision.applicationId,
    },
    {
      to: "/app/farmers/$farmerId",
      params: { farmerId: decision.farmerId },
      search: { tab: "climate" },
      icon: CloudSun,
      label: "Climate exposure",
      description: "County rainfall, drought risk, and crop health",
    },
    {
      to: "/app/farmers/$farmerId",
      params: { farmerId: decision.farmerId },
      search: { tab: "documents" },
      icon: FileText,
      label: "Documents",
      description: "Identity, land, and supporting evidence",
    },
    {
      to: "/app/analytics",
      search: { tab: "explainability" },
      icon: BarChart3,
      label: "Decision audit",
      description: "Override trends and common risk drivers",
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Supporting evidence
        </p>
        <h2 className="font-display text-xl">Related records</h2>
        <p className="text-sm text-muted-foreground">
          Jump to the borrower profile, connection map, and documents for this application.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.label}
              to={link.to}
              params={link.params}
              search={link.search}
              className="group rounded-lg border border-border bg-background p-4 transition hover:border-primary/30 hover:bg-accent/20"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
