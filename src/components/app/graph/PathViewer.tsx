import type { GraphEdge, GraphNode } from "@/api/types";
import { formatGraphLinkType } from "@/components/app/graph/graph-colors";

interface PathViewerProps {
  node: GraphNode | null;
  edges: GraphEdge[];
}

export function PathViewer({ node, edges }: PathViewerProps) {
  const relatedEdges = node
    ? edges.filter((edge) => edge.source === node.id || edge.target === node.id).slice(0, 6)
    : [];

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Direct connections
      </div>
      {node ? (
        <ul className="mt-3 space-y-2 text-sm">
          {relatedEdges.length ? (
            relatedEdges.map((edge) => (
              <li key={edge.id} className="rounded-md border border-border bg-background p-2.5">
                {edge.source} → {edge.target}
                <div className="text-xs capitalize text-muted-foreground">
                  {formatGraphLinkType(edge.type)}
                </div>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground">No direct links for this entity.</li>
          )}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Select an entity on the map to see its immediate connections.
        </p>
      )}
    </section>
  );
}
