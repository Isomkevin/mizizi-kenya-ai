import { Link } from "@tanstack/react-router";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

import { useDecisionZkCredential } from "@/api/hooks/use-zk-credential";
import type { DecisionDetail } from "@/api/types";

export function ZkCredentialBadge({
  decision,
  onVerifiedChange,
}: {
  decision: DecisionDetail;
  onVerifiedChange?: (verified: boolean) => void;
}) {
  const required = decision.zkCredentialRequired ?? decision.status === "pending";
  const { data: credential, isLoading } = useDecisionZkCredential(decision.farmerId);
  const verified = Boolean(credential);

  useEffect(() => {
    onVerifiedChange?.(verified);
  }, [verified, onVerifiedChange]);

  if (!required) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        {verified ? (
          <ShieldCheck className="mt-0.5 h-5 w-5 text-risk-low" aria-hidden />
        ) : (
          <ShieldAlert className="mt-0.5 h-5 w-5 text-risk-medium" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl">ZK credit credential</h2>
          {isLoading ? (
            <p className="mt-2 text-sm text-muted-foreground">Checking Stellar credential…</p>
          ) : verified && credential ? (
            <div className="mt-2 space-y-2 text-sm">
              <p className="text-muted-foreground">
                Verified on Stellar ({credential.mode}). Raw mobile money data was not disclosed.
              </p>
              <div className="flex flex-wrap gap-4">
                <span>
                  Tier <strong>{credential.tier}</strong> ({credential.tierLabel})
                </span>
                <span>
                  Score <strong>{credential.rawScore}</strong>/100
                </span>
                <span>
                  Limit <strong>{credential.maxUsdc} USDC</strong>
                </span>
              </div>
              {credential.explorerUrl ? (
                <a
                  href={credential.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs hover:underline"
                >
                  Stellar explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : credential.stellarTxHash ? (
                <p className="font-mono-data text-xs text-muted-foreground">
                  Tx: {credential.stellarTxHash}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Awaiting farmer ZK credential.{" "}
              <Link
                to="/app/farmers/$farmerId"
                params={{ farmerId: decision.farmerId }}
                search={{ tab: "financial" }}
                className="text-foreground underline-offset-4 hover:underline"
              >
                Open farmer financial tab
              </Link>{" "}
              to generate proof.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
