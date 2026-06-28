import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CircleDot,
  CloudSun,
  Compass,
  Eye,
  FileText,
  Landmark,
  Leaf,
  LineChart,
  MessageSquare,
  Network,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  TrendingUp,
  Users,
  Wallet,
  Wheat,
} from "lucide-react";
import { GraphBackdrop } from "@/components/landing/GraphBackdrop";
import { Counter } from "@/components/landing/Counter";
import { Reveal } from "@/components/landing/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mizizi — Connected Intelligence for Agricultural Finance" },
      {
        name: "description",
        content:
          "Agricultural finance doesn't fail because farmers are too risky. It fails because risk is invisible. Mizizi connects the signals smallholder farmers already generate into one explainable intelligence layer for banks, SACCOs and insurers.",
      },
      {
        property: "og:title",
        content: "Mizizi — Connected Intelligence for Agricultural Finance",
      },
      {
        property: "og:description",
        content:
          "Graph intelligence, climate signals and explainable AI for African agricultural finance.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <DemoVideo />
      <InvisibleFarmer />
      <CostOfFragmentation />
      <MiziziDifference />
      <Statistics />
      <WhyExistingFail />
      <PlatformPreview />
      <Ecosystem />
      <FutureVision />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------------- Nav ---------------- */

function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={["flex items-center gap-2", className].join(" ")}>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
        <Sprout className="h-4 w-4" />
      </span>
      <span className="font-display text-2xl leading-none tracking-tight">Mizizi</span>
    </Link>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a className="hover:text-foreground" href="#problem">
            Problem
          </a>
          <a className="hover:text-foreground" href="#platform">
            Platform
          </a>
          <a className="hover:text-foreground" href="#ecosystem">
            Ecosystem
          </a>
          <a className="hover:text-foreground" href="#vision">
            Vision
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/app"
            className="hidden rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent sm:inline-flex"
          >
            Open platform
          </Link>
          <a
            href="#cta"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Request demo
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-grid opacity-[0.35]" />
      <div className="absolute inset-0">
        <GraphBackdrop />
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-10 px-6 pb-28 pt-24 md:pt-32">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1 font-mono-data text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <CircleDot className="h-3 w-3 text-primary" />
            Kenya AI Challenge 2026 · AgriFin Finance
          </div>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="font-display max-w-5xl text-balance text-5xl leading-[0.95] text-foreground md:text-7xl lg:text-[88px]">
            Agricultural finance doesn't fail because farmers are too risky.{" "}
            <span className="italic text-muted-foreground">
              It fails because risk is invisible.
            </span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            Millions of smallholder farmers generate trustworthy financial signals every day.
            Current systems simply cannot connect them. Mizizi can.
          </p>
        </Reveal>

        <Reveal delay={240} className="flex flex-wrap items-center gap-3">
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-elevated transition hover:opacity-95"
          >
            Explore Mizizi
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#problem"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-5 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-accent"
          >
            See how it works
          </a>
        </Reveal>

        <Reveal delay={360}>
          <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-4 border-l border-border/70 pl-6 font-mono-data text-xs uppercase tracking-[0.15em] text-muted-foreground md:grid-cols-4">
            <span>Graph intelligence</span>
            <span>Explainable AI</span>
            <span>Climate signals</span>
            <span>Human oversight</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Section 2: Invisible Farmer ---------------- */

const silos = [
  { label: "Cooperative", icon: Users },
  { label: "SACCO", icon: Landmark },
  { label: "Mobile Money", icon: Smartphone },
  { label: "Climate Data", icon: CloudSun },
  { label: "Input Dealer", icon: Wheat },
  { label: "NGO Platform", icon: Leaf },
  { label: "Insurance", icon: ShieldCheck },
];

function DemoVideo() {
  return (
    <section className="border-b border-border/60 bg-canvas">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <SectionLabel>01 · Demo</SectionLabel>
          <h2 className="font-display mt-4 text-balance text-4xl leading-[1.05] md:text-6xl">
            See Mizizi in action.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Watch the demo to understand how the platform connects farmer data, climate signals and explainable credit decisions.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-background shadow-elevated">
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/lf699J_fWTo?si=b_DRoafClA0PnZf2"
                title="Mizizi demo video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function InvisibleFarmer() {
  return (
    <section id="problem" className="relative border-b border-border/60 bg-canvas">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionLabel>02 · The invisible farmer</SectionLabel>
          <h2 className="font-display mt-4 text-balance text-4xl leading-[1.05] md:text-6xl">
            One farmer. <br />
            Seven systems. <br />
            <span className="italic text-muted-foreground">Zero shared intelligence.</span>
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            A single farmer's financial life is fragmented across cooperatives, mobile wallets,
            input dealers, climate feeds and NGO records. Every system holds a fragment — none of
            them see the farmer.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative aspect-square w-full max-w-xl mx-auto rounded-2xl border border-border bg-background p-6 shadow-elevated">
            <div className="absolute inset-0 bg-grid-fine opacity-30 rounded-2xl" />
            <svg viewBox="0 0 400 400" className="relative h-full w-full">
              {silos.map((_, i) => {
                const angle = (i / silos.length) * Math.PI * 2 - Math.PI / 2;
                const x = 200 + Math.cos(angle) * 150;
                const y = 200 + Math.sin(angle) * 150;
                return (
                  <line
                    key={i}
                    x1={200}
                    y1={200}
                    x2={x}
                    y2={y}
                    stroke="var(--moss)"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                );
              })}
              <circle cx="200" cy="200" r="38" fill="var(--moss-deep)" />
              <text
                x="200"
                y="205"
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontSize="18"
                fill="var(--primary-foreground)"
              >
                Farmer
              </text>
            </svg>

            {silos.map((s, i) => {
              const angle = (i / silos.length) * Math.PI * 2 - Math.PI / 2;
              const left = `${50 + Math.cos(angle) * 38}%`;
              const top = `${50 + Math.sin(angle) * 38}%`;
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left, top }}
                >
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-sm">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Section 3 & 4: Two Journeys ---------------- */

const brokenJourney = [
  "Farmer applies",
  "Loan officer searches",
  "Missing information",
  "Collateral required",
  "Application declined",
  "Farmer receives 'declined'",
  "No explanation",
  "Same outcome next season",
];

const miziziJourney = [
  { label: "Farmer applies", note: "Mobile or in-branch" },
  { label: "Entity resolution", note: "Unifies fragmented records" },
  { label: "Graph intelligence", note: "Cooperative & peer signals" },
  { label: "Climate analysis", note: "Rainfall, yield risk" },
  { label: "Community analysis", note: "Repayment behaviour" },
  { label: "Explainable risk score", note: "Every factor visible" },
  { label: "Human decision", note: "Officer in the loop" },
  { label: "Actionable guidance", note: "Farmer understands why" },
];

function CostOfFragmentation() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <SectionLabel>03 · The cost of fragmentation</SectionLabel>
          <h2 className="font-display mt-4 max-w-3xl text-balance text-4xl leading-[1.05] md:text-6xl">
            What happens today.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <Reveal>
            <ol className="relative space-y-3 border-l border-dashed border-border pl-6">
              {brokenJourney.map((step, i) => (
                <li key={step} className="relative">
                  <span className="absolute -left-[31px] top-1 grid h-5 w-5 place-items-center rounded-full border border-border bg-background font-mono-data text-[10px] text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
                    <span className={i >= 4 ? "text-[color:var(--crimson)]" : "text-foreground"}>
                      {step}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="font-display mt-8 text-2xl italic text-muted-foreground">
              This isn't a data problem. It's a connection problem.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated">
              <div className="flex items-center justify-between">
                <SectionLabel>04 · The Mizizi difference</SectionLabel>
                <span className="font-mono-data text-[10px] uppercase tracking-widest text-[color:var(--moss)]">
                  Connected
                </span>
              </div>
              <h3 className="font-display mt-3 text-3xl">The same journey, with sight.</h3>
              <ol className="mt-8 space-y-2">
                {miziziJourney.map((step, i) => (
                  <li
                    key={step.label}
                    className="group grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-border hover:bg-background"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 font-mono-data text-[11px] text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{step.label}</div>
                      <div className="text-xs text-muted-foreground">{step.note}</div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MiziziDifference() {
  return null; // merged into CostOfFragmentation above for tighter narrative
}

/* ---------------- Statistics ---------------- */

const stats = [
  {
    value: 10,
    suffix: "%",
    label: "Kenyan smallholder farmers accessing formal credit",
  },
  {
    value: 11,
    suffix: "%",
    label: "Ugandan smallholder farmers accessing formal credit",
  },
  { value: 6, suffix: "%", label: "Average access across Africa" },
  {
    value: 240,
    prefix: "$",
    suffix: "B",
    label: "Annual agricultural financing gap",
  },
  {
    value: 3,
    prefix: "<",
    suffix: "%",
    label: "AFRACA lending reaching smallholders",
  },
];

function Statistics() {
  return (
    <section className="relative border-b border-border/60 bg-[color:var(--moss-deep)] text-[color:var(--primary-foreground)]">
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      <div className="relative mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <SectionLabel className="text-white/60">05 · The scale of invisibility</SectionLabel>
          <h2 className="font-display mt-4 max-w-3xl text-balance text-4xl leading-[1.05] md:text-6xl">
            A continent of farmers the system cannot see.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="flex h-full flex-col justify-between bg-[color:var(--moss-deep)] p-6">
                <div className="font-display text-5xl text-white md:text-6xl">
                  <Counter to={s.value} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} />
                </div>
                <p className="mt-6 text-sm leading-snug text-white/70">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Why Existing Fail ---------------- */

const compareRows = [
  ["Alternative data", false, "partial", true],
  ["Graph relationships", false, false, true],
  ["Climate intelligence", false, "partial", true],
  ["Explainability", false, false, true],
  ["Farmer feedback", false, false, true],
  ["Peer analysis", false, false, true],
  ["Decision audit trail", "partial", false, true],
  ["Human-in-the-loop", true, false, true],
] as const;

function Cell({ v }: { v: boolean | "partial" }) {
  if (v === true)
    return (
      <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[color:var(--moss)]/12 px-2 text-xs text-[color:var(--moss-deep)]">
        <ShieldCheck className="h-3.5 w-3.5" /> Yes
      </span>
    );
  if (v === "partial")
    return (
      <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[color:var(--amber)]/15 px-2 text-xs text-[color:var(--amber)]">
        <CircleDot className="h-3 w-3" /> Partial
      </span>
    );
  return <span className="font-mono-data text-xs text-muted-foreground/70">—</span>;
}

function WhyExistingFail() {
  return (
    <section className="border-b border-border/60 bg-canvas">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <SectionLabel>06 · Why existing systems fail</SectionLabel>
          <h2 className="font-display mt-4 max-w-3xl text-balance text-4xl leading-[1.05] md:text-6xl">
            The only solution that covers the full lending pipeline.
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 overflow-hidden rounded-2xl border border-border bg-background shadow-elevated">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground"></th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                    Traditional lending
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-muted-foreground">
                    Traditional AI
                  </th>
                  <th className="bg-primary/5 px-6 py-4 text-left font-medium text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Sprout className="h-4 w-4 text-primary" />
                      Mizizi
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map(([label, a, b, c], i) => (
                  <tr
                    key={label as string}
                    className={
                      i % 2 ? "border-b border-border/60" : "border-b border-border/60 bg-muted/20"
                    }
                  >
                    <td className="px-6 py-4 font-medium">{label}</td>
                    <td className="px-6 py-4">
                      <Cell v={a} />
                    </td>
                    <td className="px-6 py-4">
                      <Cell v={b} />
                    </td>
                    <td className="bg-primary/5 px-6 py-4">
                      <Cell v={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Platform Preview ---------------- */

const previewTabs = [
  { id: "dash", label: "Executive dashboard", icon: LineChart },
  { id: "profile", label: "Farmer intelligence", icon: Users },
  { id: "graph", label: "Graph explorer", icon: Network },
  { id: "decision", label: "Decision workspace", icon: FileText },
];

function PlatformPreview() {
  return (
    <section id="platform" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <SectionLabel>07 · The platform</SectionLabel>
          <h2 className="font-display mt-4 max-w-3xl text-balance text-4xl leading-[1.05] md:text-6xl">
            Built for the people who actually approve loans.
          </h2>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            Every surface is engineered around a single question: <em>why this decision?</em> Loan
            officers see signals, farmers see reasons, executives see portfolios.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 overflow-hidden rounded-2xl border border-border bg-card shadow-elevated">
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--crimson)]/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--amber)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--moss)]/70" />
              </div>
              <span className="ml-3 font-mono-data text-[11px] text-muted-foreground">
                mizizi.app/farmers/F-10384/explainability
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
              <aside className="hidden border-r border-border/60 bg-background/40 p-4 lg:block">
                <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
                  Workspace
                </div>
                <ul className="mt-3 space-y-1">
                  {previewTabs.map((t, i) => (
                    <li
                      key={t.id}
                      className={[
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                        i === 1 ? "bg-primary/10 text-foreground" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </li>
                  ))}
                </ul>
              </aside>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
                      Farmer · F-10384 · Nyandarua
                    </div>
                    <h3 className="font-display mt-1 text-3xl">Wanjiru Kamau</h3>
                  </div>
                  <RiskBadge level="low" score={78} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    { k: "Repayment history", v: "+24" },
                    { k: "Cooperative tenure", v: "+18" },
                    { k: "Mobile money", v: "+11" },
                    { k: "Climate exposure", v: "-7" },
                    { k: "Input purchase trend", v: "+9" },
                    { k: "Peer repayment", v: "+13" },
                  ].map((f) => (
                    <div key={f.k} className="rounded-xl border border-border bg-background p-4">
                      <div className="text-xs text-muted-foreground">{f.k}</div>
                      <div
                        className={[
                          "font-mono-data mt-1 text-xl",
                          f.v.startsWith("-")
                            ? "text-[color:var(--crimson)]"
                            : "text-[color:var(--moss-deep)]",
                        ].join(" ")}
                      >
                        {f.v}
                      </div>
                      <Bar value={parseInt(f.v)} />
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      Decision summary
                    </div>
                    <p className="mt-2 text-sm">
                      Recommend approval at <span className="font-medium">KES 84,000</span> over 9
                      months. Repayment confidence <span className="font-medium">92%</span>. Climate
                      buffer advised due to upcoming short-rains variability.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      Graph path
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {["Farmer", "Mwea Coop", "12 peers", "On-time"].map((n, i, arr) => (
                        <span key={n} className="flex items-center gap-2">
                          <span className="rounded-md border border-border bg-muted px-2 py-1">
                            {n}
                          </span>
                          {i < arr.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Bar({ value }: { value: number }) {
  const pct = Math.min(100, Math.abs(value) * 3);
  const pos = value >= 0;
  return (
    <div className="mt-3 h-1 w-full rounded-full bg-muted">
      <div
        style={{ width: `${pct}%` }}
        className={[
          "h-1 rounded-full",
          pos ? "bg-[color:var(--moss)]" : "bg-[color:var(--crimson)]",
        ].join(" ")}
      />
    </div>
  );
}

function RiskBadge({
  level,
  score,
}: {
  level: "very-low" | "low" | "medium" | "high" | "critical";
  score: number;
}) {
  const colors: Record<string, string> = {
    "very-low": "var(--risk-very-low)",
    low: "var(--risk-low)",
    medium: "var(--risk-medium)",
    high: "var(--risk-high)",
    critical: "var(--risk-critical)",
  };
  const c = colors[level];
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2"
      style={{ boxShadow: `inset 3px 0 0 0 ${c}` }}
    >
      <div>
        <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
          Risk · {level.replace("-", " ")}
        </div>
        <div className="font-display text-2xl leading-none" style={{ color: c }}>
          {score}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Ecosystem ---------------- */

const personas = [
  {
    label: "Banks",
    icon: Landmark,
    challenge: "Lack farm-level visibility",
    help: "Connected risk picture",
  },
  {
    label: "SACCOs",
    icon: Users,
    challenge: "Manual member assessment",
    help: "Automated cooperative graph",
  },
  {
    label: "Microfinance",
    icon: Wallet,
    challenge: "Limited collateral signals",
    help: "Behavioural credit signals",
  },
  {
    label: "Loan officers",
    icon: Compass,
    challenge: "Decision opacity",
    help: "Explainable workspace",
  },
  {
    label: "Insurance",
    icon: ShieldCheck,
    challenge: "Hard to verify risk",
    help: "Verified climate + farm data",
  },
  {
    label: "Cooperatives",
    icon: Sprout,
    challenge: "Repayment volatility",
    help: "Peer-level intelligence",
  },
  {
    label: "Governments",
    icon: Building2,
    challenge: "Subsidy targeting",
    help: "Population-level analytics",
  },
  {
    label: "NGOs",
    icon: Leaf,
    challenge: "Programme attribution",
    help: "Outcome-linked tracking",
  },
  {
    label: "Climate orgs",
    icon: CloudSun,
    challenge: "Smallholder reach",
    help: "Direct climate signal pipeline",
  },
  {
    label: "Farmers",
    icon: Wheat,
    challenge: "No explanation, no path",
    help: "Actionable feedback",
  },
];

function Ecosystem() {
  return (
    <section id="ecosystem" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <SectionLabel>08 · Built for the entire ecosystem</SectionLabel>
          <h2 className="font-display mt-4 max-w-3xl text-balance text-4xl leading-[1.05] md:text-6xl">
            Ten roles. One connected intelligence layer.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {personas.map((p, i) => (
            <Reveal key={p.label} delay={i * 40}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-elevated">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/8 text-primary">
                      <p.icon className="h-4 w-4" />
                    </span>
                    <span className="font-display text-xl">{p.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="mt-5 grid grid-cols-[80px_1fr] gap-y-2 text-sm">
                  <span className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
                    Today
                  </span>
                  <span className="text-muted-foreground">{p.challenge}</span>
                  <span className="font-mono-data text-[10px] uppercase tracking-widest text-[color:var(--moss)]">
                    Mizizi
                  </span>
                  <span>{p.help}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Future Vision ---------------- */

const futureIntegrations = [
  "Digital Identity",
  "Carbon Credits",
  "Crop Insurance",
  "Government Subsidies",
  "Mobile Payments",
  "Satellite Monitoring",
  "AI Agents",
  "Credit Bureaus",
  "Open Finance APIs",
];

function FutureVision() {
  return (
    <section id="vision" className="relative overflow-hidden border-b border-border/60 bg-canvas">
      <div className="absolute inset-0 bg-grid opacity-[0.4]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-28 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <SectionLabel>09 · Future vision</SectionLabel>
          <h2 className="font-display mt-4 text-balance text-4xl leading-[1.05] md:text-6xl">
            One connected intelligence layer. <br />
            <span className="italic text-muted-foreground">Unlimited financial possibilities.</span>
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            Mizizi is positioned as infrastructure, not a product. Every new signal — identity,
            carbon, satellite, payments — strengthens every decision already in the system.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative aspect-square w-full max-w-xl rounded-2xl border border-border bg-background p-6 shadow-elevated">
            <svg viewBox="0 0 400 400" className="h-full w-full">
              {futureIntegrations.map((_, i) => {
                const angle = (i / futureIntegrations.length) * Math.PI * 2;
                const x = 200 + Math.cos(angle) * 160;
                const y = 200 + Math.sin(angle) * 160;
                return (
                  <g key={i}>
                    <line
                      x1={200}
                      y1={200}
                      x2={x}
                      y2={y}
                      stroke="var(--moss)"
                      strokeOpacity="0.25"
                      strokeWidth="1"
                    />
                    {futureIntegrations.map((_, j) => {
                      if (j <= i) return null;
                      const a2 = (j / futureIntegrations.length) * Math.PI * 2;
                      const x2 = 200 + Math.cos(a2) * 160;
                      const y2 = 200 + Math.sin(a2) * 160;
                      return (
                        <line
                          key={j}
                          x1={x}
                          y1={y}
                          x2={x2}
                          y2={y2}
                          stroke="var(--moss)"
                          strokeOpacity="0.05"
                          strokeWidth="0.5"
                        />
                      );
                    })}
                  </g>
                );
              })}
              <circle cx="200" cy="200" r="44" fill="var(--moss-deep)" />
              <text
                x="200"
                y="206"
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontSize="20"
                fill="var(--primary-foreground)"
              >
                Mizizi
              </text>
            </svg>
            {futureIntegrations.map((label, i) => {
              const angle = (i / futureIntegrations.length) * Math.PI * 2;
              const left = `${50 + Math.cos(angle) * 40}%`;
              const top = `${50 + Math.sin(angle) * 40}%`;
              return (
                <div
                  key={label}
                  className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-background px-2 py-1 text-[11px] shadow-sm"
                  style={{ left, top }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */

function FinalCTA() {
  return (
    <section id="cta" className="border-b border-border/60">
      <div className="mx-auto max-w-5xl px-6 py-32 text-center">
        <Reveal>
          <Sparkles className="mx-auto h-6 w-6 text-primary" />
          <h2 className="font-display mt-6 text-balance text-4xl leading-[1.02] md:text-7xl">
            Every farmer already has a story. <br />
            <span className="italic text-muted-foreground">
              Mizizi helps financial institutions finally see it.
            </span>
          </h2>
          <p className="mt-8 text-balance text-lg text-muted-foreground">
            Transparent lending begins with connected intelligence. Build trust. Reduce risk.
            Increase financial inclusion.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:hello@lesomdynamics.com?subject=Mizizi%20demo"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-elevated transition hover:opacity-95"
            >
              Request a demo
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              <Eye className="h-4 w-4" />
              Explore the platform
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground md:inline">
            by LESOM Dynamics
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>Kenya AI Challenge 2026</span>
          <span>AgriFin Finance</span>
          <MessageSquare className="h-3 w-3" />
          <span>hello@lesomdynamics.com</span>
          <TrendingUp className="h-3 w-3" />
          <span>v1.0</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Shared ---------------- */

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "font-mono-data text-[11px] uppercase tracking-[0.22em] text-muted-foreground",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
