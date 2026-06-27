import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useGraph } from "@/api/hooks/use-graph";
import type { GraphNode } from "@/api/types";
import { GraphCanvas } from "@/components/app/graph/GraphCanvas";
import { GraphLegend } from "@/components/app/graph/GraphLegend";
import { GraphSidebar } from "@/components/app/graph/GraphSidebar";
import { GraphToolbar } from "@/components/app/graph/GraphToolbar";
import { PathViewer } from "@/components/app/graph/PathViewer";

export const Route = createFileRoute("/app/graph")({
  validateSearch: (search: Record<string, unknown>) => ({
    farmerId: typeof search.farmerId === "string" ? search.farmerId : undefined,
  }),
  head: () => ({
    meta: [{ title: "Mizizi · Connections" }],
  }),
  component: GraphWorkspace,
});

function GraphWorkspace() {
  const { farmerId } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState(2);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const { data: graph } = useGraph(farmerId, depth);

  const filteredGraph = useMemo(() => {
    if (!graph) return null;
    const q = query.trim().toLowerCase();
    if (!q) return graph;
    const nodes = graph.nodes.filter(
      (node) => node.label.toLowerCase().includes(q) || node.type.toLowerCase().includes(q),
    );
    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = graph.edges.filter(
      (edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target),
    );
    return { nodes, edges };
  }, [graph, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 overflow-x-hidden px-4 py-8 sm:px-6 sm:py-10">
      <section className="space-y-2">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Connection map
        </p>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          Borrower & cooperative links
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          See how borrowers connect to cooperatives, suppliers, loans, and climate zones.
        </p>
      </section>

      <GraphToolbar
        farmerId={farmerId}
        query={query}
        depth={depth}
        onQueryChange={setQuery}
        onDepthChange={setDepth}
        onReset={() => {
          setQuery("");
          setDepth(2);
        }}
      />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          {filteredGraph ? (
            <>
              <GraphCanvas
                graph={filteredGraph}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
              />
              <PathViewer node={selectedNode} edges={filteredGraph.edges} />
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
              Loading connection map...
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-4">
          <GraphLegend />
          <GraphSidebar selectedNode={selectedNode} />
        </div>
      </div>
    </div>
  );
}
