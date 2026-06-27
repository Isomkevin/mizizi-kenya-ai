import {
  formatGraphLinkType,
  graphLinkCanvasColor,
  graphLinkCanvasDash,
  graphLinkCanvasWidth,
  graphLinkColorVar,
  graphLinkLegendDash,
  graphLinkLegendTypes,
  graphLinkLegendWidth,
  graphNodeColorVar,
} from "@/components/app/graph/graph-colors";

const legendTypes = ["farmer", "cooperative", "dealer", "loan", "climatezone"] as const;

export function GraphLegend() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Entity types
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {legendTypes.map((type) => (
            <li key={type} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: graphNodeColorVar(type) }}
              />
              <span className="capitalize">{type.replace("climatezone", "climate zone")}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Link types
        </div>
        <ul className="mt-3 space-y-2.5 text-sm">
          {graphLinkLegendTypes.map((type) => (
            <li key={type} className="flex items-center gap-2.5">
              <span
                className="inline-block min-w-8 flex-1 border-t-2"
                style={{
                  borderColor: graphLinkColorVar(type),
                  borderTopWidth: graphLinkLegendWidth(type),
                  borderTopStyle: graphLinkLegendDash(type) ? "dashed" : "solid",
                }}
              />
              <span className="shrink-0 text-xs capitalize text-muted-foreground">
                {formatGraphLinkType(type)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
