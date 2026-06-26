import type { FarmerProfile } from "@/api/types";

export function FarmerOverviewTab({ farmer }: { farmer: FarmerProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-xl">Risk and recommendation</h3>
        <p className="mt-2 text-sm text-muted-foreground">{farmer.recommendation}</p>
        <p className="mt-3 rounded-md bg-muted/50 p-3 text-sm">{farmer.officerRecommendation}</p>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {farmer.contributingFactors.map((factor) => (
            <div key={factor.id} className="rounded-md border border-border bg-background p-3">
              <div className="font-medium">{factor.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Weight {(factor.weight * 100).toFixed(0)}% · Confidence{" "}
                {(factor.confidence * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-xl">Trust and data quality</h3>
          <dl className="mt-3 grid gap-3 text-sm">
            <Row label="Data completeness" value={`${farmer.dataCompleteness}%`} />
            <Row label="Source freshness" value={farmer.sourceFreshness} />
            <Row label="Graph connections" value={String(farmer.graphConnections)} />
          </dl>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-display text-xl">Trust indicators</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {farmer.trustIndicators.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
