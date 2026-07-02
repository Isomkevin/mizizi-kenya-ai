import type { ReactNode } from "react";

import type { FarmerProfile } from "@/api/types";
import { ZkCredentialPanel } from "@/components/app/farmers/ZkCredentialPanel";

export function FarmerFinancialTab({ farmer }: { farmer: FarmerProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ZkCredentialPanel farmer={farmer} />
      <Panel title="Repayment history">
        {farmer.repayments.map((repayment) => (
          <Row
            key={repayment.id}
            label={repayment.date}
            value={`KES ${repayment.amountKes.toLocaleString()} · ${repayment.onTime ? "On time" : "Delayed"}`}
          />
        ))}
      </Panel>
      <Panel title="Loan history">
        {farmer.loans.map((loan) => (
          <Row
            key={loan.id}
            label={loan.id}
            value={`KES ${loan.amountKes.toLocaleString()} · ${loan.termMonths} months · ${loan.status}`}
          />
        ))}
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-xl">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="font-medium">{label}</div>
      <div className="text-sm text-muted-foreground">{value}</div>
    </div>
  );
}
