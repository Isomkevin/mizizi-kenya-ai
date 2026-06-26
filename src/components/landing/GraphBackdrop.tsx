import { useEffect, useRef, useState } from "react";

type Node = {
  id: string;
  label: string;
  x: number;
  y: number;
  group: "farmer" | "system" | "signal";
};

type Edge = { from: string; to: string };

const nodes: Node[] = [
  { id: "f", label: "Farmer", x: 50, y: 50, group: "farmer" },
  { id: "coop", label: "Cooperative", x: 18, y: 18, group: "system" },
  { id: "sacco", label: "SACCO", x: 82, y: 22, group: "system" },
  { id: "mm", label: "Mobile Money", x: 90, y: 58, group: "system" },
  { id: "ins", label: "Insurance", x: 72, y: 86, group: "system" },
  { id: "input", label: "Input Dealer", x: 28, y: 88, group: "system" },
  { id: "ngo", label: "NGO", x: 8, y: 60, group: "system" },
  { id: "climate", label: "Climate", x: 50, y: 8, group: "signal" },
  { id: "peers", label: "Peers", x: 50, y: 96, group: "signal" },
];

const edges: Edge[] = nodes
  .filter((n) => n.id !== "f")
  .map((n) => ({ from: "f", to: n.id }));

// add lateral peer edges
edges.push(
  { from: "coop", to: "sacco" },
  { from: "sacco", to: "mm" },
  { from: "mm", to: "ins" },
  { from: "ins", to: "peers" },
  { from: "input", to: "ngo" },
  { from: "ngo", to: "coop" },
  { from: "climate", to: "coop" },
  { from: "climate", to: "sacco" },
);

export function GraphBackdrop({ animated = true }: { animated?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!animated) return;
    let raf: number;
    let start = performance.now();
    const tick = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  const pos = (n: Node) => {
    if (!animated) return { x: n.x, y: n.y };
    const phase = (n.id.charCodeAt(0) % 7) * 0.7;
    return {
      x: n.x + Math.sin(t * 0.4 + phase) * 0.6,
      y: n.y + Math.cos(t * 0.35 + phase) * 0.6,
    };
  };

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--moss)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--moss)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--moss)" stopOpacity="0.05" />
          <stop offset="50%" stopColor="var(--moss)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--moss)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="38" fill="url(#glow)" />

      {edges.map((e, i) => {
        const a = pos(nodes.find((n) => n.id === e.from)!);
        const b = pos(nodes.find((n) => n.id === e.to)!);
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="url(#edge)"
            strokeWidth={0.15}
          />
        );
      })}

      {nodes.map((n) => {
        const p = pos(n);
        const r =
          n.group === "farmer" ? 1.6 : n.group === "system" ? 0.9 : 0.7;
        const fill =
          n.group === "farmer"
            ? "var(--moss-deep)"
            : n.group === "signal"
            ? "var(--amber)"
            : "var(--moss)";
        return (
          <g key={n.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={r * 2.2}
              fill={fill}
              opacity={0.12}
            />
            <circle cx={p.x} cy={p.y} r={r} fill={fill} />
          </g>
        );
      })}
    </svg>
  );
}
