import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-2d";

import type { GraphNode, GraphPayload } from "@/api/types";
import {
  formatGraphLinkType,
  graphLinkCanvasColor,
  graphLinkCanvasDash,
  graphLinkCanvasWidth,
  graphNodeCanvasColor,
  resolveCssVar,
} from "@/components/app/graph/graph-colors";

interface GraphCanvasProps {
  graph: GraphPayload;
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
}

type ForceGraphNode = GraphNode & { val?: number; color?: string };
type ForceGraphLink = LinkObject & { type?: string };

const CANVAS_HEIGHT = 540;
const NODE_REL_SIZE = 3.5;
const NODE_VAL = 4;
const NODE_VAL_SELECTED = 6;

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

function linkEndpointId(endpoint: LinkObject["source"] | LinkObject["target"]): string {
  if (typeof endpoint === "object" && endpoint !== null && "id" in endpoint) {
    return String(endpoint.id);
  }
  return String(endpoint);
}

function isLinkConnectedToNode(link: ForceGraphLink, nodeId: string | undefined): boolean {
  if (!nodeId) return false;
  return linkEndpointId(link.source) === nodeId || linkEndpointId(link.target) === nodeId;
}

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
        val: NODE_VAL,
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

  const primaryColor = useMemo(() => resolveCssVar("--primary"), []);
  const mutedLinkColor = useMemo(() => resolveCssVar("--border"), []);

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
      return selectedNode?.id === data.id ? NODE_VAL_SELECTED : NODE_VAL;
    },
    [selectedNode?.id],
  );

  const linkColor = useCallback(
    (link: LinkObject) => {
      const data = link as ForceGraphLink;
      const type = data.type ?? "";
      if (!selectedNode?.id) return graphLinkCanvasColor(type);
      if (isLinkConnectedToNode(data, selectedNode.id)) return graphLinkCanvasColor(type);
      return mutedLinkColor;
    },
    [mutedLinkColor, selectedNode?.id],
  );

  const linkWidth = useCallback(
    (link: LinkObject) => {
      const data = link as ForceGraphLink;
      const type = data.type ?? "";
      const base = graphLinkCanvasWidth(type);
      if (!selectedNode?.id) return base;
      if (isLinkConnectedToNode(data, selectedNode.id)) return base + 1.25;
      return Math.max(base * 0.55, 1.25);
    },
    [selectedNode?.id],
  );

  const linkLineDash = useCallback((link: LinkObject) => {
    const data = link as ForceGraphLink;
    return graphLinkCanvasDash(data.type ?? "");
  }, []);

  const linkLabel = useCallback((link: LinkObject) => {
    const data = link as ForceGraphLink;
    return formatGraphLinkType(data.type ?? "relationship");
  }, []);

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
            nodeRelSize={NODE_REL_SIZE}
            nodeColor={nodeColor}
            nodeVal={nodeVal}
            linkWidth={linkWidth}
            linkColor={linkColor}
            linkLineDash={linkLineDash}
            linkCurvature={0.12}
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
            linkLabel={linkLabel}
            linkLabelSize={0.65}
            backgroundColor="transparent"
            warmupTicks={80}
            cooldownTicks={100}
            nodePointerArea={10}
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
