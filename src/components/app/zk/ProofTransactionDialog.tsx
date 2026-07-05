import { ExternalLink, Copy, CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";
import { useState } from "react";

import { usePipelineEvents } from "@/api/hooks/use-credit-pipeline";
import type { AgentEvent, AgentEventStep } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const STEP_ORDER: AgentEventStep[] = [
  "input-validation",
  "witness-build",
  "proof-generation",
  "proof-verification",
  "stellar-submission",
  "credential-issued",
  "drawdown-submitted",
];

const STEP_LABELS: Record<AgentEventStep, string> = {
  "input-validation": "Input validation",
  "witness-build": "Witness build",
  "proof-generation": "ZK proof generation (Groth16)",
  "proof-verification": "Proof verification",
  "stellar-submission": "Stellar submission",
  "credential-issued": "Credential issued",
  "drawdown-submitted": "USDC drawdown",
  orchestration: "Orchestration",
};

function StepIcon({ status }: { status: string }) {
  if (status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === "failed") return <XCircle className="h-4 w-4 text-rose-500" />;
  if (status === "running") return <Loader2 className="h-4 w-4 animate-spin text-amber-500" />;
  return <Circle className="h-4 w-4 text-muted-foreground/40" />;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      <Copy className="h-3 w-3" />
      {copied ? "copied" : "copy"}
    </button>
  );
}

export function ProofTransactionDialog({
  open,
  onOpenChange,
  pipelineId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pipelineId?: string;
}) {
  const { data, isLoading } = usePipelineEvents(open ? pipelineId : undefined);
  const events: AgentEvent[] = data ?? [];

  const stepEvents = new Map<AgentEventStep, AgentEvent>();
  for (const e of events) {
    const existing = stepEvents.get(e.step);
    if (!existing || new Date(e.startedAt) > new Date(existing.startedAt)) {
      stepEvents.set(e.step, e);
    }
  }

  const orch = stepEvents.get("orchestration");
  const verify = stepEvents.get("proof-verification");
  const stellar = stepEvents.get("stellar-submission");
  const drawdown = stepEvents.get("drawdown-submitted");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Proof & Transaction
            {orch ? (
              <Badge
                variant={
                  orch.status === "success"
                    ? "default"
                    : orch.status === "failed"
                      ? "destructive"
                      : "secondary"
                }
              >
                {orch.status}
              </Badge>
            ) : null}
          </DialogTitle>
          <DialogDescription className="font-mono text-[11px]">
            pipeline {pipelineId ?? "—"}
          </DialogDescription>
        </DialogHeader>

        {/* Summary strip */}
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Proof verified
            </p>
            <p className="mt-1 text-sm font-medium">
              {verify?.status === "success" ? (
                <span className="text-emerald-600">✓ Groth16 valid</span>
              ) : verify?.status === "failed" ? (
                <span className="text-rose-600">✗ Failed</span>
              ) : (
                <span className="text-muted-foreground">Pending</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Stellar credential tx
            </p>
            {stellar?.txHash ? (
              <div className="mt-1 flex items-center gap-1.5">
                <code className="truncate text-xs">{stellar.txHash.slice(0, 14)}…</code>
                <CopyButton value={stellar.txHash} />
                {stellar.explorerUrl ? (
                  <a
                    href={stellar.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">—</p>
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Drawdown tx
            </p>
            {drawdown?.txHash ? (
              <div className="mt-1 flex items-center gap-1.5">
                <code className="truncate text-xs">{drawdown.txHash.slice(0, 14)}…</code>
                <CopyButton value={drawdown.txHash} />
                {drawdown.explorerUrl ? (
                  <a
                    href={drawdown.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">—</p>
            )}
          </div>
        </div>

        {/* Step-by-step logs */}
        {isLoading && !events.length ? (
          <p className="mt-4 text-xs text-muted-foreground">Loading pipeline events…</p>
        ) : (
          <ol className="mt-2 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {STEP_ORDER.map((step) => {
              const ev = stepEvents.get(step);
              const status = ev?.status ?? "pending";
              return (
                <li key={step} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <StepIcon status={status} />
                    <p className="text-sm font-medium">{STEP_LABELS[step]}</p>
                    {ev?.agent ? (
                      <span className="text-[10px] text-muted-foreground">· {ev.agent}</span>
                    ) : null}
                    {ev?.durationMs ? (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {ev.durationMs}ms
                      </span>
                    ) : null}
                  </div>
                  {ev?.message ? (
                    <p className="mt-1 text-xs text-muted-foreground">{ev.message}</p>
                  ) : null}
                  {ev?.error ? (
                    <p className="mt-1 text-xs text-rose-600">{ev.error}</p>
                  ) : null}
                  {ev?.txHash ? (
                    <div className="mt-1 flex items-center gap-1.5">
                      <code className="break-all text-[11px] font-mono">{ev.txHash}</code>
                      {ev.explorerUrl ? (
                        <a
                          href={ev.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  {ev?.input || ev?.output ? (
                    <details className="mt-2 text-[11px]">
                      <summary className="cursor-pointer text-muted-foreground">
                        logs (input / output)
                      </summary>
                      <pre className="mt-1 whitespace-pre-wrap break-words rounded bg-muted p-2">
                        {JSON.stringify({ input: ev.input, output: ev.output }, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}

        <div className="flex justify-end">
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
