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
    meta: [{ title: "Mizizi · Graph Workspace" }],
  }),
  component: GraphWorkspace,
});

function GraphWorkspace() {
  const { farmerId } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const { data: graph } = useGraph(farmerId);

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
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 sm:py-10">
      <section className="space-y-2">
        <p className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
          Graph workspace
        </p>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          Graph Intelligence Workspace
        </h1>
      </section>

      <GraphToolbar
        farmerId={farmerId}
        query={query}
        onQueryChange={setQuery}
        onReset={() => setQuery("")}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
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
              Loading graph workspace...
            </div>
          )}
        </div>
        <div className="space-y-4">
          <GraphLegend />
          <GraphSidebar selectedNode={selectedNode} />
        </div>
      </div>
    </div>
  );
}
