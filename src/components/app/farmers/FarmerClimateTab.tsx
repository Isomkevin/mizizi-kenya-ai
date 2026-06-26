import type { FarmerProfile } from "@/api/types";

export function FarmerClimateTab({ farmer }: { farmer: FarmerProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-xl">Climate signal summary</h3>
        <p className="mt-2 text-sm text-muted-foreground">{farmer.climate.insight}</p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <Metric label="Rainfall" value={`${farmer.climate.rainfallMm} mm`} />
          <Metric
            label="Drought prob."
            value={`${(farmer.climate.droughtProbability * 100).toFixed(0)}%`}
          />
          <Metric label="NDVI" value={farmer.climate.ndvi.toFixed(2)} />
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-xl">Recent observations</h3>
        <ul className="mt-3 space-y-2">
          {farmer.climate.observations.map((observation) => (
            <li
              key={`${observation.date}-${observation.label}`}
              className="rounded-md border border-border bg-background p-3"
            >
              <div className="font-medium">
                {observation.date} · {observation.label}
              </div>
              <div className="text-sm text-muted-foreground">{observation.value}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
