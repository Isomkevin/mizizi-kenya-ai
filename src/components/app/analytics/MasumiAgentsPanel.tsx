import { Bot, CircleCheck, CircleX, Loader2, Play, RefreshCw } from "lucide-react";

import { useMasumiJobs, useMasumiStatus, useRunOrchestrator } from "@/api/hooks/use-masumi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MasumiAgentsPanel({ className }: { className?: string }) {
  const statusQuery = useMasumiStatus();
  const jobsQuery = useMasumiJobs({ limit: 8 });
  const runOrchestrator = useRunOrchestrator();

  const status = statusQuery.data;
  const jobs = jobsQuery.data ?? [];

  return (
    <section className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
            Masumi agent layer
          </p>
          <h3 className="font-display text-xl">Agentic data collection</h3>
          <p className="text-sm text-muted-foreground">
            Mode{" "}
            <strong className="text-foreground">{status?.mode ?? "loading…"}</strong>
            {status?.paymentConnected ? " · Payment node connected" : ""}
            {status ? ` · ${status.jobsPending} pending · ${status.jobsCompleted24h} delivered (24h)` : ""}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={runOrchestrator.isPending || status?.mode === "disabled"}
          onClick={() => void runOrchestrator.mutateAsync({ limit: 20 })}
        >
          {runOrchestrator.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run orchestrator
        </Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(status?.agents ?? []).map((agent) => (
          <div key={agent.agentType} className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{agent.route}</span>
              {agent.status === "available" ? (
                <CircleCheck className="ml-auto h-4 w-4 text-emerald-600" />
              ) : (
                <CircleX className="ml-auto h-4 w-4 text-amber-600" />
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{agent.message ?? agent.status}</p>
          </div>
        ))}
      </div>

      {jobs.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
            Recent jobs
          </p>
          <ul className="space-y-2">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <span>
                  {job.enrichType} · {job.farmerId}
                </span>
                <span className="font-mono-data text-[11px] uppercase tracking-wider text-muted-foreground">
                  {job.status}
                  {job.masumiTxHash ? ` · ${job.masumiTxHash.slice(0, 12)}…` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <RefreshCw className="h-3 w-3" />
        Agents poll Open-Meteo and cooperative APIs with on-chain audit hashes in demo/live mode.
      </div>
    </section>
  );
}
