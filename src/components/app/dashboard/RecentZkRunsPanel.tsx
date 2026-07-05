import { useState } from "react";
import { ExternalLink, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";

import { useRecentPipelines } from "@/api/hooks/use-credit-pipeline";
import type { PipelineRunSummary } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProofTransactionDialog } from "@/components/app/zk/ProofTransactionDialog";

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function ProofBadge({ run }: { run: PipelineRunSummary }) {
  if (run.status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-rose-600">
        <ShieldX className="h-3.5 w-3.5" /> failed
      </span>
    );
  }
  if (run.proofVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <ShieldCheck className="h-3.5 w-3.5" /> verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-amber-600">
      <ShieldAlert className="h-3.5 w-3.5" /> pending
    </span>
  );
}

export function RecentZkRunsPanel({ limit = 10 }: { limit?: number }) {
  const { data, isLoading } = useRecentPipelines(limit);
  const runs = data ?? [];
  const [selected, setSelected] = useState<string | undefined>();

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl">Stellar ZK Credit Rails · Recent runs</h2>
          <p className="text-xs text-muted-foreground">
            Every pipeline run with proof verification and Stellar transaction status.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          live · refresh 5s
        </span>
      </header>

      {isLoading && !runs.length ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading recent runs…</p>
      ) : runs.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No ZK Credit Rails runs yet.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Open a farmer profile and click "Run credit pipeline" to generate your first proof.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">Farmer</th>
                <th className="py-2 pr-3 font-medium">Proof</th>
                <th className="py-2 pr-3 font-medium">Stellar tx</th>
                <th className="py-2 pr-3 font-medium">Drawdown</th>
                <th className="py-2 pr-3 font-medium">Tier</th>
                <th className="py-2 pr-0 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.pipelineId} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-3 text-xs text-muted-foreground">
                    {relative(run.startedAt)}
                  </td>
                  <td className="py-2 pr-3">
                    <p className="font-medium">{run.farmerName ?? run.farmerId}</p>
                    <p className="text-[10px] text-muted-foreground">{run.farmerId}</p>
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    <ProofBadge run={run} />
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    {run.stellarTxHash ? (
                      <div className="flex items-center gap-1.5">
                        <code className="text-[11px]">{run.stellarTxHash.slice(0, 10)}…</code>
                        {run.stellarExplorerUrl ? (
                          <a
                            href={run.stellarExplorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                        {run.stellarMode ? (
                          <Badge variant="outline" className="text-[9px] py-0 h-4">
                            {run.stellarMode}
                          </Badge>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    {run.drawdownAmount ? (
                      <div className="flex items-center gap-1.5">
                        <span>{run.drawdownAmount} USDC</span>
                        {run.drawdownExplorerUrl ? (
                          <a
                            href={run.drawdownExplorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-xs">{run.credentialTier ?? "—"}</td>
                  <td className="py-2 pr-0 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(run.pipelineId)}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProofTransactionDialog
        open={Boolean(selected)}
        onOpenChange={(v) => !v && setSelected(undefined)}
        pipelineId={selected}
      />
    </section>
  );
}
