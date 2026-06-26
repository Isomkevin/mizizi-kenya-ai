import { useEffect, useState } from "react";

import type { GraphNode, GraphPayload } from "@/api/types";
import { graphNodeColor } from "@/components/app/graph/GraphLegend";

interface GraphCanvasProps {
  graph: GraphPayload;
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode) => void;
}

export function GraphCanvas({ graph, selectedNode, onSelectNode }: GraphCanvasProps) {
  const [ForceGraph2D, setForceGraph2D] =
    useState<null | (typeof import("react-force-graph-2d"))["default"]>(null);

  useEffect(() => {
    let mounted = true;
    void import("react-force-graph-2d").then((module) => {
      if (mounted) setForceGraph2D(() => module.default);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ForceGraph2D) {
    return (
      <div className="grid h-[540px] place-items-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        Loading graph canvas...
      </div>
    );
  }

  return (
    <div className="h-[540px] rounded-xl border border-border bg-card">
      <ForceGraph2D
        graphData={{
          nodes: graph.nodes.map((node) => ({
            ...node,
            val: selectedNode?.id === node.id ? 9 : 6,
            color: graphNodeColor(node.type),
          })),
          links: graph.edges.map((edge) => ({
            ...edge,
            source: edge.source,
            target: edge.target,
          })),
        }}
        nodeRelSize={6}
        linkWidth={1.4}
        linkColor={() => "var(--border)"}
        backgroundColor="transparent"
        onNodeClick={(node) => onSelectNode(node as GraphNode)}
        nodeLabel={(node) => {
          const data = node as GraphNode;
          return `${data.label} (${data.type})`;
        }}
      />
    </div>
  );
}
