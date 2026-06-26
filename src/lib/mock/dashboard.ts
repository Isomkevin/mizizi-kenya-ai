import type { ActivityType, MapMetric, RiskLevel } from "./types";

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  href?: string;
}

export interface RiskBand {
  level: RiskLevel;
  label: string;
  percent: number;
  farmers: number;
  avgLoanKes: number;
  approvalRate: number;
  climateExposure: number;
}

export interface DashboardInsight {
  id: string;
  title: string;
  body: string;
  why: string;
  icon: "climate" | "graph" | "shield" | "duplicate";
  severity: RiskLevel;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: ActivityType;
  message: string;
  actor: string;
  confidence?: number;
  risk: RiskLevel;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
}

export interface CountyIntel {
  id: string;
  name: string;
  /** SVG path for schematic Kenya map */
  path: string;
  risk: RiskLevel;
  loanVolumeM: number;
  climateExposure: number;
  approvalRate: number;
  farmers: number;
  cooperatives: number;
  applications: number;
}

export interface WelcomeSnapshot {
  greeting: string;
  subtitle: string;
  summary: string;
  weatherInsight: string;
  pendingApprovals: number;
  portfolioHealth: "healthy" | "watch" | "critical";
  aiJobsToday: number;
  recentAlerts: number;
}

export const welcomeSnapshot: WelcomeSnapshot = {
  greeting: "Good morning, Kevin",
  subtitle: "Today's agricultural lending overview",
  summary:
    "Three signals need your attention. Nothing critical. Climate variance in Nyandarua is the most material — Mizizi already drafted a buffer recommendation for review.",
  weatherInsight: "La Niña watch · above-normal rainfall expected in Rift Valley",
  pendingApprovals: 14,
  portfolioHealth: "healthy",
  aiJobsToday: 6,
  recentAlerts: 3,
};

export const dashboardKpis: DashboardKpi[] = [
  {
    id: "pending-reviews",
    label: "Pending reviews",
    value: "14",
    delta: "−3 vs yesterday",
    trend: "down",
    href: "/app/decisions",
  },
  {
    id: "approved-today",
    label: "Approved today",
    value: "28",
    delta: "+6 vs avg",
    trend: "up",
    href: "/app/decisions",
  },
  {
    id: "applications",
    label: "Applications in progress",
    value: "186",
    delta: "+22 / 7d",
    trend: "up",
    href: "/app/farmers",
  },
  {
    id: "decision-time",
    label: "Avg. decision time",
    value: "4.2h",
    delta: "−18 min",
    trend: "down",
  },
  {
    id: "portfolio-risk",
    label: "Portfolio-at-risk",
    value: "3.1%",
    delta: "−0.4%",
    trend: "down",
    href: "/app/portfolio",
  },
  {
    id: "confidence",
    label: "Avg. confidence",
    value: "0.91",
    delta: "+0.03",
    trend: "up",
  },
  {
    id: "farmers",
    label: "Farmers connected",
    value: "18,402",
    delta: "+412 / 30d",
    trend: "up",
    href: "/app/farmers",
  },
  {
    id: "graph-health",
    label: "Graph health",
    value: "98.4%",
    delta: "Neo4j synced",
    trend: "neutral",
    href: "/app/graph",
  },
];

export const riskBands: RiskBand[] = [
  {
    level: "very-low",
    label: "Very low",
    percent: 42,
    farmers: 7733,
    avgLoanKes: 62000,
    approvalRate: 94,
    climateExposure: 12,
  },
  {
    level: "low",
    label: "Low",
    percent: 28,
    farmers: 5153,
    avgLoanKes: 78000,
    approvalRate: 88,
    climateExposure: 18,
  },
  {
    level: "medium",
    label: "Medium",
    percent: 18,
    farmers: 3312,
    avgLoanKes: 94000,
    approvalRate: 72,
    climateExposure: 34,
  },
  {
    level: "high",
    label: "High",
    percent: 9,
    farmers: 1656,
    avgLoanKes: 112000,
    approvalRate: 54,
    climateExposure: 48,
  },
  {
    level: "critical",
    label: "Critical",
    percent: 3,
    farmers: 552,
    avgLoanKes: 128000,
    approvalRate: 31,
    climateExposure: 62,
  },
];

export const dashboardInsights: DashboardInsight[] = [
  {
    id: "ins-1",
    title: "High-confidence approvals available",
    body: "18 applications scored ≥ 0.92 with full explainability traces.",
    why: "Repayment history and cooperative linkage are both strong across the batch.",
    icon: "shield",
    severity: "very-low",
  },
  {
    id: "ins-2",
    title: "Climate risk increasing in Nakuru",
    body: "Rainfall variance up 14% vs seasonal baseline across 8 cooperatives.",
    why: "ENSO signal plus soil moisture deficit in lower Rift zones.",
    icon: "climate",
    severity: "medium",
  },
  {
    id: "ins-3",
    title: "Repayment improving in Mwea Coop cluster",
    body: "Combined on-time rate rose to 96% after graph-resolved peer links.",
    why: "Shared input dealer and irrigation access reduced income volatility.",
    icon: "graph",
    severity: "low",
  },
  {
    id: "ins-4",
    title: "Potential duplicate farmer records",
    body: "4 pairs flagged by entity resolution in Meru — review recommended.",
    why: "Matching national ID fragments and mobile money handles.",
    icon: "duplicate",
    severity: "medium",
  },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    timestamp: "09:42",
    type: "loan-approved",
    message: "Officer Mwende approved KES 84,000 for Wanjiru Kamau",
    actor: "Grace Mwende",
    confidence: 0.94,
    risk: "low",
  },
  {
    id: "act-2",
    timestamp: "09:31",
    type: "climate-refresh",
    message: "Climate model flagged 3 cooperatives in Nyandarua",
    actor: "Climate pipeline",
    risk: "medium",
  },
  {
    id: "act-3",
    timestamp: "09:14",
    type: "graph-updated",
    message: "Graph resolver linked 12 farmers to Mwea Coop",
    actor: "Neo4j sync",
    confidence: 0.89,
    risk: "low",
  },
  {
    id: "act-4",
    timestamp: "08:58",
    type: "explanation-generated",
    message: "Explainability audit completed for 482 Q3 decisions",
    actor: "XAI service",
    confidence: 0.91,
    risk: "low",
  },
  {
    id: "act-5",
    timestamp: "08:41",
    type: "sms-delivered",
    message: "Repayment reminder delivered to 1,240 farmers in Kiambu",
    actor: "USSD gateway",
    risk: "very-low",
  },
  {
    id: "act-6",
    timestamp: "08:22",
    type: "officer-override",
    message: "Officer Otieno overrode medium-risk flag for KES 120,000 loan",
    actor: "James Otieno",
    confidence: 0.76,
    risk: "medium",
  },
];

export const quickActions: QuickAction[] = [
  {
    id: "qa-1",
    label: "Create farmer",
    description: "Register a new farmer profile",
    href: "/app/farmers",
  },
  {
    id: "qa-2",
    label: "Run graph analysis",
    description: "Explore peer clusters and linkages",
    href: "/app/graph",
  },
  {
    id: "qa-3",
    label: "Generate explanation",
    description: "Produce decision rationale",
    href: "/app/decisions",
  },
  {
    id: "qa-4",
    label: "Request climate refresh",
    description: "Pull latest rainfall and soil signals",
    href: "/app/climate",
  },
  {
    id: "qa-5",
    label: "Export report",
    description: "Download portfolio snapshot",
    href: "/app/analytics",
  },
  {
    id: "qa-6",
    label: "Review pending",
    description: "14 applications awaiting decision",
    href: "/app/decisions",
  },
];

/** Schematic county regions — simplified for dashboard mock */
export const countyIntel: CountyIntel[] = [
  {
    id: "nairobi",
    name: "Nairobi",
    path: "M 118 142 L 128 138 L 132 148 L 124 154 Z",
    risk: "low",
    loanVolumeM: 142,
    climateExposure: 22,
    approvalRate: 86,
    farmers: 1240,
    cooperatives: 18,
    applications: 94,
  },
  {
    id: "kiambu",
    name: "Kiambu",
    path: "M 108 128 L 118 124 L 122 136 L 112 140 Z",
    risk: "low",
    loanVolumeM: 98,
    climateExposure: 28,
    approvalRate: 84,
    farmers: 2104,
    cooperatives: 24,
    applications: 112,
  },
  {
    id: "nakuru",
    name: "Nakuru",
    path: "M 88 118 L 104 112 L 108 128 L 92 134 Z",
    risk: "medium",
    loanVolumeM: 156,
    climateExposure: 41,
    approvalRate: 71,
    farmers: 3420,
    cooperatives: 31,
    applications: 148,
  },
  {
    id: "nyandarua",
    name: "Nyandarua",
    path: "M 78 108 L 92 104 L 96 118 L 82 122 Z",
    risk: "medium",
    loanVolumeM: 88,
    climateExposure: 52,
    approvalRate: 68,
    farmers: 1892,
    cooperatives: 14,
    applications: 86,
  },
  {
    id: "meru",
    name: "Meru",
    path: "M 118 88 L 134 84 L 138 100 L 122 104 Z",
    risk: "low",
    loanVolumeM: 124,
    climateExposure: 26,
    approvalRate: 82,
    farmers: 2840,
    cooperatives: 22,
    applications: 102,
  },
  {
    id: "embu",
    name: "Embu",
    path: "M 104 100 L 118 96 L 122 112 L 108 116 Z",
    risk: "low",
    loanVolumeM: 76,
    climateExposure: 30,
    approvalRate: 79,
    farmers: 1620,
    cooperatives: 16,
    applications: 74,
  },
  {
    id: "kirinyaga",
    name: "Kirinyaga",
    path: "M 96 112 L 108 108 L 112 122 L 100 126 Z",
    risk: "very-low",
    loanVolumeM: 112,
    climateExposure: 18,
    approvalRate: 91,
    farmers: 2240,
    cooperatives: 19,
    applications: 88,
  },
  {
    id: "makueni",
    name: "Makueni",
    path: "M 88 138 L 102 134 L 106 150 L 92 154 Z",
    risk: "high",
    loanVolumeM: 64,
    climateExposure: 58,
    approvalRate: 52,
    farmers: 1980,
    cooperatives: 12,
    applications: 62,
  },
  {
    id: "machakos",
    name: "Machakos",
    path: "M 102 142 L 116 138 L 120 154 L 106 158 Z",
    risk: "medium",
    loanVolumeM: 72,
    climateExposure: 44,
    approvalRate: 66,
    farmers: 1760,
    cooperatives: 11,
    applications: 58,
  },
  {
    id: "kisumu",
    name: "Kisumu",
    path: "M 48 108 L 64 104 L 68 120 L 52 124 Z",
    risk: "low",
    loanVolumeM: 94,
    climateExposure: 32,
    approvalRate: 77,
    farmers: 2540,
    cooperatives: 20,
    applications: 96,
  },
  {
    id: "kakamega",
    name: "Kakamega",
    path: "M 52 92 L 68 88 L 72 104 L 56 108 Z",
    risk: "low",
    loanVolumeM: 86,
    climateExposure: 35,
    approvalRate: 74,
    farmers: 2680,
    cooperatives: 17,
    applications: 84,
  },
  {
    id: "uasin-gishu",
    name: "Uasin Gishu",
    path: "M 68 78 L 84 74 L 88 90 L 72 94 Z",
    risk: "very-low",
    loanVolumeM: 168,
    climateExposure: 20,
    approvalRate: 89,
    farmers: 4120,
    cooperatives: 28,
    applications: 134,
  },
  {
    id: "trans-nzoia",
    name: "Trans Nzoia",
    path: "M 56 72 L 72 68 L 76 84 L 60 88 Z",
    risk: "low",
    loanVolumeM: 102,
    climateExposure: 24,
    approvalRate: 81,
    farmers: 2980,
    cooperatives: 21,
    applications: 98,
  },
  {
    id: "mombasa",
    name: "Mombasa",
    path: "M 108 168 L 120 164 L 124 176 L 112 180 Z",
    risk: "medium",
    loanVolumeM: 58,
    climateExposure: 38,
    approvalRate: 70,
    farmers: 840,
    cooperatives: 8,
    applications: 42,
  },
];

export const mapMetricLabels: Record<MapMetric, string> = {
  risk: "Risk level",
  loanVolume: "Loan volume",
  climate: "Climate exposure",
  approvalRate: "Approval rate",
};

export function riskColor(level: RiskLevel): string {
  const map: Record<RiskLevel, string> = {
    "very-low": "var(--risk-very-low)",
    low: "var(--risk-low)",
    medium: "var(--risk-medium)",
    high: "var(--risk-high)",
    critical: "var(--risk-critical)",
  };
  return map[level];
}

export function metricValue(county: CountyIntel, metric: MapMetric): number {
  switch (metric) {
    case "risk":
      return { "very-low": 1, low: 2, medium: 3, high: 4, critical: 5 }[county.risk] ?? 3;
    case "loanVolume":
      return county.loanVolumeM;
    case "climate":
      return county.climateExposure;
    case "approvalRate":
      return county.approvalRate;
  }
}
