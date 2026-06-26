import type { RiskLevel } from "@/api/types";

export const riskLabels: Record<RiskLevel, string> = {
  "very-low": "Very low",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function riskColor(level: RiskLevel): string {
  return {
    "very-low": "var(--risk-very-low)",
    low: "var(--risk-low)",
    medium: "var(--risk-medium)",
    high: "var(--risk-high)",
    critical: "var(--risk-critical)",
  }[level];
}
