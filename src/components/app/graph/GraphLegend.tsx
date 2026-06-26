const nodeTypeColors: Record<string, string> = {
  farmer: "var(--risk-medium)",
  cooperative: "var(--moss)",
  dealer: "var(--azure)",
  county: "var(--amber)",
};

export function GraphLegend() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
        Graph legend
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {Object.entries(nodeTypeColors).map(([type, color]) => (
          <li key={type} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="capitalize">{type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function graphNodeColor(type: string) {
  return nodeTypeColors[type] ?? "var(--muted-foreground)";
}
