import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Activity,
  CloudSun,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

const kpis = [
  { label: "Farmers in portfolio", value: "18,402", delta: "+412 / 30d" },
  { label: "Active loans", value: "KES 1.84B", delta: "+6.2%" },
  { label: "Portfolio-at-risk", value: "3.1%", delta: "−0.4%" },
  { label: "Avg. explainability score", value: "0.91", delta: "+0.03" },
];

const insights = [
  {
    icon: CloudSun,
    title: "Rainfall variance rising in Nyandarua",
    body: "12 cooperatives now flagged amber. Recommend climate buffer for 1,184 active loans.",
  },
  {
    icon: Network,
    title: "New peer cluster detected in Meru",
    body: "62 farmers linked by shared cooperative + input dealer. Combined repayment 96%.",
  },
  {
    icon: ShieldCheck,
    title: "Explainability audit complete",
    body: "All Q3 decisions traced to contributing factors with confidence ≥ 0.84.",
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
      <section className="flex flex-col gap-2">
        <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
          Welcome back
        </div>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          The portfolio is calm this morning.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Three signals need your attention. Nothing critical. Climate variance
          in Nyandarua is the most material — Mizizi already drafted a buffer
          recommendation for review.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card p-6">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="font-display mt-2 text-3xl">{k.value}</div>
            <div className="font-mono-data mt-2 text-[11px] uppercase tracking-widest text-[color:var(--moss)]">
              {k.delta}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
                Risk distribution
              </div>
              <h2 className="font-display mt-1 text-2xl">Portfolio composition</h2>
            </div>
            <Link
              to="/app/analytics"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Open analytics <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-6 flex h-3 w-full overflow-hidden rounded-full">
            {[
              { c: "var(--risk-very-low)", w: 42 },
              { c: "var(--risk-low)", w: 28 },
              { c: "var(--risk-medium)", w: 18 },
              { c: "var(--risk-high)", w: 9 },
              { c: "var(--risk-critical)", w: 3 },
            ].map((s, i) => (
              <div
                key={i}
                style={{ width: `${s.w}%`, background: s.c }}
                className="h-full"
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs md:grid-cols-5">
            {[
              ["Very low", "var(--risk-very-low)", "42%"],
              ["Low", "var(--risk-low)", "28%"],
              ["Medium", "var(--risk-medium)", "18%"],
              ["High", "var(--risk-high)", "9%"],
              ["Critical", "var(--risk-critical)", "3%"],
            ].map(([label, color, pct]) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: color as string }}
                />
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono-data ml-auto">{pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
              AI insights · today
            </div>
          </div>
          <ul className="mt-4 space-y-4">
            {insights.map((i) => (
              <li
                key={i.title}
                className="rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                    <i.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-medium">{i.title}</div>
                    <div className="text-xs text-muted-foreground">{i.body}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
            Recent activity
          </div>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {[
            ["09:42", "Officer Mwende approved KES 84,000 for Wanjiru Kamau", "low"],
            ["09:31", "Climate model flagged 3 cooperatives in Nyandarua", "medium"],
            ["09:14", "Graph resolver linked 12 farmers to Mwea Coop", "low"],
            ["08:58", "Explainability audit completed for 482 Q3 decisions", "low"],
          ].map(([t, msg, level]) => (
            <li key={t} className="flex items-center gap-4 py-3 text-sm">
              <span className="font-mono-data w-12 text-xs text-muted-foreground">
                {t}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background:
                    level === "medium"
                      ? "var(--risk-medium)"
                      : "var(--risk-low)",
                }}
              />
              <span>{msg}</span>
              <Users className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
