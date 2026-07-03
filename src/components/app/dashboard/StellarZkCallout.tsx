import { Link } from "@tanstack/react-router";
import { ArrowRight, CircleDot, Lock, ShieldCheck, Wallet, Workflow } from "lucide-react";

export function StellarZkCallout() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-[color:var(--moss-deep)] p-6 text-[color:var(--primary-foreground)] shadow-elevated">
      <div className="absolute inset-0 bg-grid opacity-[0.08]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono-data text-[10px] uppercase tracking-widest text-white/70">
            <CircleDot className="h-3 w-3 text-[color:var(--moss)]" />
            Stellar ZK Credit Rails · Live
          </div>
          <h2 className="font-display mt-3 text-2xl text-white md:text-3xl">
            Issue a farmer credit credential on Stellar — without revealing their M-Pesa data.
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/70">
            Run the full agent pipeline: witness build → Groth16 proof → Stellar submission →
            USDC drawdown. Every step streamed to the agents activity timeline.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/app/farmers"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-[color:var(--moss-deep)] transition hover:opacity-95"
            >
              Run ZK pipeline on a farmer
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/app/decisions"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3.5 py-2 text-sm font-medium text-white/90 transition hover:bg-white/5"
            >
              See ZK-gated decisions
            </Link>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-3">
          {[
            { icon: Workflow, label: "Witness" },
            { icon: Lock, label: "Groth16 proof" },
            { icon: ShieldCheck, label: "Stellar anchor" },
            { icon: Wallet, label: "USDC drawdown" },
          ].map((s) => (
            <li
              key={s.label}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
            >
              <s.icon className="h-4 w-4 text-[color:var(--moss)]" />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
