import type { FarmerProfile } from "@/api/types";

export function FarmerActivityTab({ farmer }: { farmer: FarmerProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-xl">Timeline</h3>
        <ul className="mt-3 space-y-2">
          {farmer.timeline.map((event) => (
            <li
              key={event.id}
              className="rounded-md border border-border bg-background p-3 text-sm"
            >
              <div className="font-medium">
                {event.timestamp} · {event.title}
              </div>
              <div className="text-muted-foreground">{event.description}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display text-xl">Communications</h3>
        <ul className="mt-3 space-y-2">
          {farmer.communications.map((message) => (
            <li
              key={message.id}
              className="rounded-md border border-border bg-background p-3 text-sm"
            >
              <div className="font-medium">
                {message.channel.toUpperCase()} · {message.status}
              </div>
              <div className="text-muted-foreground">{message.message}</div>
              <div className="mt-1 text-xs text-muted-foreground">{message.timestamp}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
