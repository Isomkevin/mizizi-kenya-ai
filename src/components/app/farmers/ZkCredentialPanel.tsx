import { ExternalLink, ShieldCheck, ShieldOff, Wallet, Workflow } from "lucide-react";
import { useState } from "react";

import { useIssueZkCredential, useSimulateDrawdown, useZkCredentialStatus } from "@/api/hooks/use-zk-credential";
import type { FarmerProfile } from "@/api/types";
import { Button } from "@/components/ui/button";
import { CreditPipelineDialog } from "@/components/app/farmers/CreditPipelineDialog";

export function ZkCredentialPanel({ farmer }: { farmer: FarmerProfile }) {
  const { data: status, isLoading } = useZkCredentialStatus(farmer.id);
  const issueCredential = useIssueZkCredential(farmer.id);
  const drawdown = useSimulateDrawdown(farmer.id);
  const credential = status?.credential ?? farmer.zkCredential;
  const [pipelineOpen, setPipelineOpen] = useState(false);

  async function handleIssue() {
    await issueCredential.mutateAsync();
  }

  async function handleDrawdown() {
    await drawdown.mutateAsync(credential?.maxUsdc);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">ZK Credit Credential</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Prove creditworthiness from simulated mobile money + repayment history without revealing
            raw transactions. Verified on Stellar via Groth16.
          </p>
        </div>
        {credential ? (
          <ShieldCheck className="h-5 w-5 text-risk-low" aria-hidden />
        ) : (
          <ShieldOff className="h-5 w-5 text-muted-foreground" aria-hidden />
        )}
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Checking credential status…</p>
      ) : credential ? (
        <div className="mt-4 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Tier" value={`${credential.tier} · ${credential.tierLabel}`} />
            <Metric label="Score band" value={`${credential.rawScore}/100`} />
            <Metric label="Max USDC" value={String(credential.maxUsdc)} />
            <Metric
              label="Valid until"
              value={new Date(credential.validUntil).toLocaleDateString()}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-3 text-sm">
              <div className="font-medium">Public commitment</div>
              <div className="mt-1 break-all font-mono-data text-xs text-muted-foreground">
                {credential.farmerCommitment}
              </div>
              {credential.stellarTxHash ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  Stellar ({credential.mode}):{" "}
                  {credential.explorerUrl ? (
                    <a
                      href={credential.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-foreground hover:underline"
                    >
                      View transaction
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="font-mono-data">{credential.stellarTxHash}</span>
                  )}
                </div>
              ) : null}
            </div>

            <div className="rounded-md border border-border bg-background p-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <Wallet className="h-4 w-4" />
                Credit Drawdown
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Use your verified ZK credential to request a credit drawdown on the Stellar blockchain.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => void handleDrawdown()}
                  disabled={drawdown.isPending}
                >
                  {drawdown.isPending ? "Processing…" : `Request $${credential.maxUsdc} Drawdown`}
                </Button>
                {drawdown.isSuccess && (
                  <a
                    href={drawdown.data?.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-foreground hover:underline"
                  >
                    View Tx <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {drawdown.isError && (
                <p className="mt-2 text-xs text-destructive" role="alert">
                  {drawdown.error instanceof Error ? drawdown.error.message : "Drawdown failed."}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {status?.message ??
              "Generate a Groth16 proof bound to your repayment and M-Pesa turnover signals."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => void handleIssue()}
              disabled={issueCredential.isPending || status?.canProve === false}
            >
              {issueCredential.isPending ? "Generating proof…" : "Generate ZK credential"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPipelineOpen(true)}
              disabled={status?.canProve === false}
            >
              <Workflow className="mr-1 h-3.5 w-3.5" />
              Run full pipeline
            </Button>
          </div>
          {issueCredential.isError ? (
            <p className="text-xs text-destructive" role="alert">
              {issueCredential.error instanceof Error
                ? issueCredential.error.message
                : "Failed to issue credential."}
            </p>
          ) : null}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Lenders see tier, score band, and limit only — not individual M-Pesa or repayment rows.
      </p>
      <CreditPipelineDialog
        open={pipelineOpen}
        onOpenChange={setPipelineOpen}
        farmerId={farmer.id}
        amount={credential?.maxUsdc}
      />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
