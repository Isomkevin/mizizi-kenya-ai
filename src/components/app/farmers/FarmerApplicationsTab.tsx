import type { FarmerProfile } from "@/api/types";

export function FarmerApplicationsTab({ farmer }: { farmer: FarmerProfile }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-xl">Applications</h3>
      <div className="mt-3 space-y-2">
        {farmer.applications.map((application) => (
          <div
            key={application.id}
            className="rounded-md border border-border bg-background p-3 text-sm"
          >
            <div className="font-medium">
              {application.id} · {application.cropType}
            </div>
            <div className="text-muted-foreground">
              KES {application.amountKes.toLocaleString()} · {application.status} · Submitted{" "}
              {application.submittedAt}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
