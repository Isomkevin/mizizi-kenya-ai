import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods, NodeObject } from "react-force-graph-2d";

import type { GraphNode, GraphPayload } from "@/api/types";
import { graphNodeCanvasColor, resolveCssVar } from "@/components/app/graph/graph-colors";

interface GraphCanvasProps {
  graph: GraphPayload;
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
}

type ForceGraphNode = GraphNode & { val?: number; color?: string };

function toGraphNode(node: NodeObject): GraphNode {
  const data = node as ForceGraphNode;
  return {
    id: String(data.id),
    label: String(data.label),
    type: String(data.type),
    risk: data.risk,
    properties: data.properties ?? {},
    provenance: data.provenance,
    lastUpdated: data.lastUpdated,
  };
}

const CANVAS_HEIGHT = 540;

export function GraphCanvas({ graph, selectedNode, onSelectNode }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: CANVAS_HEIGHT });
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
      const width = el.clientWidth;
      const height = el.clientHeight;
      setDimensions((prev) => {
        if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
          return prev;
        }
        return {
          width: Math.max(width, 1),
          height: Math.max(height, CANVAS_HEIGHT),
        };
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
        val: 6,
        color: graphNodeCanvasColor(node.type),
      })),
      links: graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      })),
    }),
    [graph.nodes, graph.edges],
  );

  const linkColor = useMemo(() => resolveCssVar("--border"), []);
  const primaryColor = useMemo(() => resolveCssVar("--primary"), []);

  useEffect(() => {
    if (!fgRef.current || graph.nodes.length === 0) return;
    const timer = window.setTimeout(() => fgRef.current?.zoomToFit(400, 48), 350);
    return () => window.clearTimeout(timer);
  }, [graph.nodes, graph.edges, ForceGraph2D]);

  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      onSelectNode(toGraphNode(node));
    },
    [onSelectNode],
  );

  const handleBackgroundClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  const nodeColor = useCallback(
    (node: NodeObject) => {
      const data = node as ForceGraphNode;
      if (selectedNode?.id === data.id) return primaryColor;
      return data.color ?? graphNodeCanvasColor(data.type);
    },
    [primaryColor, selectedNode?.id],
  );

  const nodeVal = useCallback(
    (node: NodeObject) => {
      const data = node as ForceGraphNode;
      return selectedNode?.id === data.id ? 10 : 6;
    },
    [selectedNode?.id],
  );

  const containerClassName =
    "relative h-[540px] w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-card";

  if (!ForceGraph2D) {
    return (
      <div
        ref={containerRef}
        className={`grid place-items-center text-sm text-muted-foreground ${containerClassName}`}
      >
        Loading graph canvas...
      </div>
    );
  }

  return (
    <div ref={containerRef} className={containerClassName}>
      {dimensions.width > 0 ? (
        <div className="absolute inset-0">
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeRelSize={6}
            nodeColor={nodeColor}
            nodeVal={nodeVal}
            linkWidth={1.4}
            linkColor={() => linkColor}
            backgroundColor="transparent"
            warmupTicks={80}
            cooldownTicks={100}
            nodePointerArea={14}
            enableNodeDrag
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBackgroundClick}
            nodeLabel={(node) => {
              const data = node as ForceGraphNode;
              return `${data.label} (${data.type})`;
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
