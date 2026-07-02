import { ExternalLink, ShieldCheck, ShieldOff } from "lucide-react";

import { useIssueZkCredential, useZkCredentialStatus } from "@/api/hooks/use-zk-credential";
import type { FarmerProfile } from "@/api/types";
import { Button } from "@/components/ui/button";

export function ZkCredentialPanel({ farmer }: { farmer: FarmerProfile }) {
  const { data: status, isLoading } = useZkCredentialStatus(farmer.id);
  const issueCredential = useIssueZkCredential(farmer.id);
  const credential = status?.credential ?? farmer.zkCredential;

  async function handleIssue() {
    await issueCredential.mutateAsync();
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Tier" value={`${credential.tier} · ${credential.tierLabel}`} />
          <Metric label="Score band" value={`${credential.rawScore}/100`} />
          <Metric label="Max USDC" value={String(credential.maxUsdc)} />
          <Metric
            label="Valid until"
            value={new Date(credential.validUntil).toLocaleDateString()}
          />
          <div className="sm:col-span-2 lg:col-span-4 rounded-md border border-border bg-background p-3 text-sm">
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
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {status?.message ??
              "Generate a Groth16 proof bound to your repayment and M-Pesa turnover signals."}
          </p>
          <Button
            size="sm"
            onClick={() => void handleIssue()}
            disabled={issueCredential.isPending || status?.canProve === false}
          >
            {issueCredential.isPending ? "Generating proof…" : "Generate ZK credential"}
          </Button>
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
