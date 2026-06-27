import { graphNodeColorVar } from "@/components/app/graph/graph-colors";

const legendTypes = ["farmer", "cooperative", "dealer", "loan", "climatezone"] as const;

export function GraphLegend() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
        Graph legend
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {legendTypes.map((type) => (
          <li key={type} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: graphNodeColorVar(type) }}
            />
            <span className="capitalize">{type.replace("climatezone", "climate zone")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
