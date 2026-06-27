import { Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, Network } from "lucide-react";

import type { FarmerProfile } from "@/api/types";
import { RiskBadge } from "@/components/app/RiskBadge";
import { Button } from "@/components/ui/button";

export function FarmerProfileHeader({ farmer }: { farmer: FarmerProfile }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            to="/app/farmers"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to search
          </Link>
          <h1 className="font-display text-3xl leading-tight md:text-4xl">{farmer.name}</h1>
          <div className="font-mono-data text-[11px] uppercase tracking-wider text-muted-foreground">
            {farmer.farmerId} · {farmer.cooperative} · {farmer.county}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span className="rounded-md border border-border bg-background px-2 py-1">
              Verification: {farmer.verificationStatus}
            </span>
            <span className="rounded-md border border-border bg-background px-2 py-1">
              Decision: {farmer.decisionStatus}
            </span>
            <RiskBadge level={farmer.risk} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/app/graph" search={{ farmerId: farmer.id }}>
              <Network className="h-4 w-4" />
              View connections
            </Link>
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4" />
            Export profile
          </Button>
        </div>
      </div>
    </section>
  );
}
