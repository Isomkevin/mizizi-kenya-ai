/** CSS custom-property names keyed by normalized graph node type. */
const nodeTypeColorVars: Record<string, string> = {
  farmer: "--risk-medium",
  cooperative: "--moss",
  dealer: "--azure",
  inputdealer: "--azure",
  county: "--amber",
  climatezone: "--amber",
  loan: "--risk-low",
};

/** Visual weight per relationship type — width (px) and optional dash pattern. */
const linkTypeStyles: Record<string, { cssVar: string; width: number; dash?: number[] }> = {
  memberof: { cssVar: "--moss", width: 3.5 },
  ownsloan: { cssVar: "--risk-high", width: 4.5 },
  purchasesfrom: { cssVar: "--azure", width: 3, dash: [6, 4] },
  locatedin: { cssVar: "--amber", width: 2.75, dash: [3, 5] },
  workswith: { cssVar: "--primary", width: 3.25 },
  operatesin: { cssVar: "--moss-soft", width: 2.5, dash: [5, 4] },
};

export function normalizeGraphNodeType(type: string) {
  return type.toLowerCase().replace(/[_\s-]+/g, "");
}

export function normalizeGraphLinkType(type: string) {
  return type.toLowerCase().replace(/[_\s-]+/g, "");
}

export function resolveCssVar(varName: string): string {
  if (typeof document === "undefined") return "#888888";
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || "#888888";
}

/** Resolved color for canvas rendering (CSS variables are invalid in canvas fillStyle). */
export function graphNodeCanvasColor(type: string): string {
  const key = normalizeGraphNodeType(type);
  const cssVar = nodeTypeColorVars[key] ?? "--muted-foreground";
  return resolveCssVar(cssVar);
}

/** CSS variable token for DOM elements (legend swatches, etc.). */
export function graphNodeColorVar(type: string): string {
  const key = normalizeGraphNodeType(type);
  const cssVar = nodeTypeColorVars[key] ?? "--muted-foreground";
  return `var(${cssVar})`;
}

export function graphLinkStyle(type: string) {
  const key = normalizeGraphLinkType(type);
  return linkTypeStyles[key] ?? { cssVar: "--moss", width: 2.75 };
}

export function graphLinkCanvasColor(type: string): string {
  return resolveCssVar(graphLinkStyle(type).cssVar);
}

export function graphLinkCanvasWidth(type: string): number {
  return graphLinkStyle(type).width;
}

export function graphLinkCanvasDash(type: string): number[] | undefined {
  return graphLinkStyle(type).dash;
}

/** Human-readable relationship label for tooltips and legend. */
export function formatGraphLinkType(type: string): string {
  return type.replace(/_/g, " ").toLowerCase();
}

export const graphLinkLegendTypes = [
  "MEMBER_OF",
  "OWNS_LOAN",
  "PURCHASES_FROM",
  "LOCATED_IN",
  "WORKS_WITH",
] as const;

export function graphLinkColorVar(type: string): string {
  const cssVar = graphLinkStyle(type).cssVar;
  return `var(${cssVar})`;
}

export function graphLinkLegendWidth(type: string): number {
  return graphLinkStyle(type).width;
}

export function graphLinkLegendDash(type: string): string | undefined {
  const dash = graphLinkStyle(type).dash;
  if (!dash) return undefined;
  return `${dash[0]}px ${dash[1]}px`;
}
