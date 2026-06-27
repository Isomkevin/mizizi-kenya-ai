import type { GraphNode } from "@/api/types";
import { RiskBadge } from "@/components/app/RiskBadge";
import { formatGraphNodeType } from "@/lib/risk-display";

interface GraphSidebarProps {
  selectedNode: GraphNode | null;
}

export function GraphSidebar({ selectedNode }: GraphSidebarProps) {
  return (
    <aside className="rounded-xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Selected entity
      </div>
      {selectedNode ? (
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <div className="font-medium">{selectedNode.label}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs capitalize text-muted-foreground">
                {formatGraphNodeType(selectedNode.type)}
              </span>
              {selectedNode.risk ? <RiskBadge level={selectedNode.risk} /> : null}
            </div>
            {selectedNode.provenance ? (
              <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Source: {selectedNode.provenance}
              </p>
            ) : null}
          </div>
          <dl className="space-y-2">
            {Object.entries(selectedNode.properties).map(([key, value]) => (
              <div key={key} className="rounded-md border border-border bg-background p-2.5">
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {key.replaceAll(/([A-Z])/g, " $1").trim()}
                </dt>
                <dd className="mt-1 font-medium">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Select an entity on the map to see details and risk context.
        </p>
      )}
    </aside>
  );
}
