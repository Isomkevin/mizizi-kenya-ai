import ForceGraph2D from "react-force-graph-2d";

import type { GraphNode, GraphPayload } from "@/api/types";
import { graphNodeColor } from "@/components/app/graph/GraphLegend";

interface GraphCanvasProps {
  graph: GraphPayload;
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode) => void;
}

export function GraphCanvas({ graph, selectedNode, onSelectNode }: GraphCanvasProps) {
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
