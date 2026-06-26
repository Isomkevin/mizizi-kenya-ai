import type { GraphNode } from "@/api/types";

interface GraphSidebarProps {
  selectedNode: GraphNode | null;
}

export function GraphSidebar({ selectedNode }: GraphSidebarProps) {
  return (
    <aside className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
        Node inspector
      </div>
      {selectedNode ? (
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <div className="font-medium">{selectedNode.label}</div>
            <div className="text-xs capitalize text-muted-foreground">{selectedNode.type}</div>
          </div>
          <dl className="space-y-2">
            {Object.entries(selectedNode.properties).map(([key, value]) => (
              <div key={key} className="rounded-md border border-border bg-background p-2.5">
                <dt className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
                  {key}
                </dt>
                <dd className="mt-1 font-medium">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Select a node to inspect provenance, metadata and risk context.
        </p>
      )}
    </aside>
  );
}
