import { useRecentAgentEvents } from "@/api/hooks/use-credit-pipeline";
import type { AgentEvent } from "@/api/types";

const STATUS_DOT: Record<string, string> = {
  running: "bg-amber-500",
  success: "bg-emerald-500",
  failed: "bg-rose-500",
  pending: "bg-muted-foreground/40",
};

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

export function AgentsActivityTimeline({ limit = 25 }: { limit?: number }) {
  const { data, isLoading } = useRecentAgentEvents(limit);
  const events: AgentEvent[] = data ?? [];

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl">Agents activity</h2>
          <p className="text-xs text-muted-foreground">
            Every Mizizi agent action, inputs, outputs and blockchain result.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          live · refresh 5s
        </span>
      </header>

      {isLoading && !events.length ? (
        <p className="mt-4 text-xs text-muted-foreground">Loading agent events…</p>
      ) : events.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          No agent activity yet. Trigger a credit pipeline to see events here.
        </p>
      ) : (
        <ol className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {events.map((ev) => (
            <li key={ev.id} className="rounded-lg border border-border/60 p-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${STATUS_DOT[ev.status] ?? "bg-muted"}`}
                />
                <p className="text-sm font-medium">{ev.agent}</p>
                <span className="text-[10px] text-muted-foreground">
                  {ev.step} · farmer {ev.farmerId}
                </span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {relative(ev.startedAt)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{ev.message}</p>
              {ev.error ? (
                <p className="mt-1 text-xs text-rose-600">{ev.error}</p>
              ) : null}
              {ev.txHash ? (
                <p className="mt-1 text-[11px] font-mono break-all">
                  {ev.explorerUrl ? (
                    <a
                      href={ev.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {ev.txHash}
                    </a>
                  ) : (
                    ev.txHash
                  )}
                </p>
              ) : null}
              {ev.input || ev.output ? (
                <details className="mt-2 text-[11px]">
                  <summary className="cursor-pointer text-muted-foreground">
                    input/output
                  </summary>
                  <pre className="mt-1 whitespace-pre-wrap break-words rounded bg-muted p-2">
                    {JSON.stringify({ input: ev.input, output: ev.output }, null, 2)}
                  </pre>
                </details>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
