import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, CloudSun, FileUp, Loader2, ShieldQuestion } from "lucide-react";

import { useRequestEnrichment } from "@/api/hooks/use-farmers";
import type { DataGap, DataGapAction, FarmerProfile } from "@/api/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FarmerDataGapsPanelProps {
  farmer: FarmerProfile;
  variant?: "default" | "compact";
  className?: string;
}

const actionLabels: Record<DataGapAction, string> = {
  upload: "Upload document",
  enrich_api: "Request enrichment",
  officer_input: "Officer review",
  farmer_consent: "Request consent",
};

function gapStatusLabel(status: DataGap["status"]): string {
  switch (status) {
    case "present":
      return "Linked";
    case "pending_enrichment":
      return "Requested";
    case "stale":
      return "Stale";
    default:
      return "Missing";
  }
}

function GapActionLink({ farmerId, gap }: { farmerId: string; gap: DataGap }) {
  if (gap.suggestedAction === "upload") {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link to="/app/farmers/$farmerId" params={{ farmerId }} search={{ tab: "documents" }}>
          <FileUp className="h-3.5 w-3.5" />
          {actionLabels.upload}
        </Link>
      </Button>
    );
  }

  if (gap.suggestedAction === "farmer_consent") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="Consent workflow coming with Masumi agents"
      >
        <ShieldQuestion className="h-3.5 w-3.5" />
        {actionLabels.farmer_consent}
      </Button>
    );
  }

  return null;
}

export function FarmerDataGapsPanel({
  farmer,
  variant = "default",
  className,
}: FarmerDataGapsPanelProps) {
  const requestEnrichment = useRequestEnrichment();
  const gaps = farmer.dataGaps ?? [];
  const missing = gaps.filter((gap) => gap.status === "missing");
  const pending = gaps.filter((gap) => gap.status === "pending_enrichment");

  async function handleRequestAll() {
    await requestEnrichment.mutateAsync({ farmerId: farmer.id });
  }

  async function handleRequestGap(gapId: DataGap["id"]) {
    await requestEnrichment.mutateAsync({ farmerId: farmer.id, gapIds: [gapId] });
  }

  if (!gaps.length) return null;

  const showBanner = missing.length > 0 || pending.length > 0 || farmer.insufficientData;

  if (variant === "compact" && !showBanner) return null;

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-5",
        farmer.insufficientData && missing.length > 0 && "border-amber-500/30",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
            Data completeness
          </p>
          <h3 className={cn("font-display", variant === "compact" ? "text-lg" : "text-xl")}>
            {missing.length === 0 ? "Key signals linked" : "Missing signals detected"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Profile completeness{" "}
            <strong className="text-foreground">{farmer.dataCompleteness}%</strong>
            {farmer.insufficientData ? " · advisory scoring only" : ""}
          </p>
        </div>
        {missing.some((gap) => gap.enrichType) ? (
          <Button
            size="sm"
            onClick={() => void handleRequestAll()}
            disabled={requestEnrichment.isPending}
          >
            {requestEnrichment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudSun className="h-4 w-4" />
            )}
            Request missing data
          </Button>
        ) : null}
      </div>

      {farmer.insufficientData && missing.length > 0 ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Decision confidence is limited until critical signals are linked. Review gaps below or
            upload supporting documents.
          </span>
        </div>
      ) : null}

      <ul className={cn("space-y-2", variant === "compact" ? "mt-3" : "mt-4")}>
        {(variant === "compact" ? [...missing, ...pending] : gaps).map((gap) => (
          <li
            key={gap.id}
            className={cn(
              "rounded-lg border border-border bg-background p-3",
              gap.status === "missing" && gap.severity === "critical" && "border-amber-500/20",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{gap.label}</span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-mono-data text-[10px] uppercase tracking-wider",
                      gap.status === "present"
                        ? "bg-emerald-500/10 text-emerald-700"
                        : gap.status === "pending_enrichment"
                          ? "bg-sky-500/10 text-sky-700"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {gapStatusLabel(gap.status)}
                  </span>
                  <span className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                    {gap.severity}
                  </span>
                </div>
                {variant !== "compact" || gap.status !== "present" ? (
                  <p className="text-xs text-muted-foreground">{gap.reason}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {gap.status === "missing" && gap.enrichType ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleRequestGap(gap.id)}
                    disabled={requestEnrichment.isPending}
                  >
                    Request
                  </Button>
                ) : null}
                {gap.status === "missing" ? <GapActionLink farmerId={farmer.id} gap={gap} /> : null}
                {gap.status === "pending_enrichment" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Queued
                  </span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {variant === "default" && missing.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Link
            to="/app/farmers/$farmerId"
            params={{ farmerId: farmer.id }}
            search={{ tab: "documents" }}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Upload documents <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            to="/app/graph"
            search={{ farmerId: farmer.id }}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Inspect graph neighbourhood <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
