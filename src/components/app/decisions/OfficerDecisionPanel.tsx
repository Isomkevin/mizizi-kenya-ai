import { useState } from "react";

import type { DecisionDetail } from "@/api/types";
import { useSubmitDecision } from "@/api/hooks/use-decisions";
import { useSimulateDrawdown } from "@/api/hooks/use-zk-credential";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function OfficerDecisionPanel({
  decision,
  credentialVerified = true,
}: {
  decision: DecisionDetail;
  credentialVerified?: boolean;
}) {
  const [note, setNote] = useState(decision.officerExplanation);
  const [message, setMessage] = useState<string | null>(null);
  const submitDecision = useSubmitDecision();
  const drawdown = useSimulateDrawdown(decision.farmerId);
  const requiresCredential =
    (decision.zkCredentialRequired ?? decision.status === "pending") && !credentialVerified;

  async function handleAction(
    status: DecisionDetail["status"],
    recommendation: DecisionDetail["recommendation"],
  ) {
    setMessage(null);
    try {
      await submitDecision.mutateAsync({
        id: decision.id,
        status,
        recommendation,
        officerExplanation: note.trim(),
      });
      if (status === "approved" && credentialVerified) {
        try {
          const result = await drawdown.mutateAsync();
          setMessage(`Decision saved. Drawdown simulated: ${result.amount} USDC (${result.mode}).`);
          return;
        } catch {
          setMessage("Decision saved. Drawdown skipped (no credential or zero limit).");
          return;
        }
      }
      setMessage("Decision saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to submit decision.");
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-2xl">Your decision</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Mizizi recommends — you decide. Add notes for the audit trail.
        {requiresCredential ? " ZK credential required before approval." : null}
      </p>
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="mt-3 min-h-28"
        placeholder="Add your rationale for this decision..."
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => void handleAction("approved", "approve")}
          disabled={submitDecision.isPending || requiresCredential}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void handleAction("pending", "request_info")}
          disabled={submitDecision.isPending}
        >
          Request info
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => void handleAction("declined", "decline")}
          disabled={submitDecision.isPending}
        >
          Decline
        </Button>
      </div>
      {message ? (
        <p className="mt-3 text-xs text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
