import { useState } from "react";

import type { DecisionDetail } from "@/api/types";
import { useSubmitDecision } from "@/api/hooks/use-decisions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function OfficerDecisionPanel({ decision }: { decision: DecisionDetail }) {
  const [note, setNote] = useState(decision.officerExplanation);
  const [message, setMessage] = useState<string | null>(null);
  const submitDecision = useSubmitDecision();

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
          disabled={submitDecision.isPending}
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
