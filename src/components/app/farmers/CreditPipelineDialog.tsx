import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { AgentEvent, AgentEventStep } from "@/api/types";
import {
  usePipelineEvents,
  useRunCreditPipeline,
} from "@/api/hooks/use-credit-pipeline";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProofTransactionDialog } from "@/components/app/zk/ProofTransactionDialog";


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
  "proof-generation": "Proof generation",
  "proof-verification": "Proof verification",
  "stellar-submission": "Stellar submission",
  "credential-issued": "Credential issued",
  "drawdown-submitted": "Drawdown submitted",
  orchestration: "Orchestration",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  failed: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export function CreditPipelineDialog({
  open,
  onOpenChange,
  farmerId,
  amount,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  farmerId: string;
  amount?: number;
}) {
  const runPipeline = useRunCreditPipeline();
  const [pipelineId, setPipelineId] = useState<string | undefined>();
  const eventsQuery = usePipelineEvents(pipelineId);

  const events: AgentEvent[] = eventsQuery.data ?? runPipeline.data?.events ?? [];
  const stepEvents = new Map<AgentEventStep, AgentEvent>();
  for (const e of events) {
    const existing = stepEvents.get(e.step);
    if (!existing || new Date(e.startedAt) > new Date(existing.startedAt)) {
      stepEvents.set(e.step, e);
    }
  }

  const isRunning = runPipeline.isPending;
  const finalStatus = runPipeline.data?.status;

  async function start() {
    const result = await runPipeline.mutateAsync({ farmerId, amount, autoDrawdown: true });
    setPipelineId(result.pipelineId);
  }

  useEffect(() => {
    if (open && !pipelineId && !isRunning && !runPipeline.data) {
      void start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ZK credit pipeline</DialogTitle>
          <DialogDescription>
            Farmer {farmerId} — end-to-end proof and Stellar submission.
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {STEP_ORDER.map((step) => {
            const ev = stepEvents.get(step);
            const status = ev?.status ?? "pending";
            return (
              <li key={step} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{STEP_LABELS[step]}</p>
                    {ev?.agent ? (
                      <p className="text-xs text-muted-foreground">{ev.agent}</p>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${STATUS_STYLES[status]}`}
                  >
                    {status}
                  </span>
                </div>
                {ev?.message ? (
                  <p className="mt-2 text-xs text-muted-foreground">{ev.message}</p>
                ) : null}
                {ev?.error ? (
                  <p className="mt-1 text-xs text-rose-600">{ev.error}</p>
                ) : null}
                {ev?.txHash ? (
                  <p className="mt-1 text-[11px] font-mono break-all">
                    tx:{" "}
                    {ev.explorerUrl ? (
                      <a
                        href={ev.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {ev.txHash}
                      </a>
                    ) : (
                      ev.txHash
                    )}
                  </p>
                ) : null}
                {ev?.output ? (
                  <details className="mt-2 text-[11px]">
                    <summary className="cursor-pointer text-muted-foreground">Logs</summary>
                    <pre className="mt-1 whitespace-pre-wrap break-words rounded bg-muted p-2">
                      {JSON.stringify(ev.output, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </li>
            );
          })}
        </ol>

        <DialogFooter className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {finalStatus === "success"
              ? "Pipeline completed successfully."
              : finalStatus === "failed"
                ? "Pipeline failed. You can retry."
                : isRunning
                  ? "Running..."
                  : ""}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPipelineId(undefined);
                runPipeline.reset();
                void start();
              }}
              disabled={isRunning}
            >
              Retry
            </Button>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
