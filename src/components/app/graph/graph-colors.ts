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

export function normalizeGraphNodeType(type: string) {
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
