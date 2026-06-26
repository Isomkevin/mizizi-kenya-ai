import { useState } from "react";

import type { DecisionDetail } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function OfficerDecisionPanel({ decision }: { decision: DecisionDetail }) {
  const [note, setNote] = useState(decision.officerExplanation);

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-display text-2xl">Officer decision panel</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Add a decision rationale to keep the audit trail explainable.
      </p>
      <Textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="mt-3 min-h-28"
        placeholder="Write officer rationale..."
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm">Approve</Button>
        <Button size="sm" variant="secondary">
          Request info
        </Button>
        <Button size="sm" variant="destructive">
          Decline
        </Button>
      </div>
    </section>
  );
}
