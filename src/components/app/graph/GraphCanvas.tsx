import { useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods } from "react-force-graph-2d";

import type { GraphNode, GraphPayload } from "@/api/types";
import { graphNodeCanvasColor, resolveCssVar } from "@/components/app/graph/graph-colors";

interface GraphCanvasProps {
  graph: GraphPayload;
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode) => void;
}

export function GraphCanvas({ graph, selectedNode, onSelectNode }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 540 });
  const [ForceGraph2D, setForceGraph2D] = useState<
    null | (typeof import("react-force-graph-2d"))["default"]
  >(null);

  useEffect(() => {
    let mounted = true;
    void import("react-force-graph-2d").then((module) => {
      if (mounted) setForceGraph2D(() => module.default);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect();
      setDimensions({
        width: Math.max(Math.floor(width), 1),
        height: Math.max(Math.floor(height), 1),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ForceGraph2D]);

  const graphData = useMemo(
    () => ({
      nodes: graph.nodes.map((node) => ({
        ...node,
        val: selectedNode?.id === node.id ? 9 : 6,
        color: graphNodeCanvasColor(node.type),
      })),
      links: graph.edges.map((edge) => ({
        ...edge,
        source: edge.source,
        target: edge.target,
      })),
    }),
    [graph.nodes, graph.edges, selectedNode?.id],
  );

  const linkColor = useMemo(() => resolveCssVar("--border"), []);

  useEffect(() => {
    if (!fgRef.current || graphData.nodes.length === 0) return;
    const timer = window.setTimeout(() => fgRef.current?.zoomToFit(400, 48), 350);
    return () => window.clearTimeout(timer);
  }, [graphData, ForceGraph2D]);

  if (!ForceGraph2D) {
    return (
      <div
        ref={containerRef}
        className="grid h-[540px] w-full place-items-center rounded-xl border border-border bg-card text-sm text-muted-foreground"
      >
        Loading graph canvas...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[540px] w-full overflow-hidden rounded-xl border border-border bg-card"
    >
      {dimensions.width > 0 ? (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeRelSize={6}
          linkWidth={1.4}
          linkColor={() => linkColor}
          backgroundColor="transparent"
          warmupTicks={80}
          cooldownTicks={120}
          onNodeClick={(node) => onSelectNode(node as GraphNode)}
          nodeLabel={(node) => {
            const data = node as GraphNode;
            return `${data.label} (${data.type})`;
          }}
        />
      ) : null}
    </div>
  );
}
