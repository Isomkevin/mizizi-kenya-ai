import type { RiskLevel, SearchEntityType } from "./types";

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle: string;
  location: string;
  status: string;
  risk: RiskLevel;
  href: string;
  recentActivity?: string;
}

export const searchIndex: SearchResult[] = [
  {
    id: "f-001",
    type: "farmer",
    title: "Wanjiru Kamau",
    subtitle: "Smallholder · maize + beans",
    location: "Kiambu",
    status: "Active loan",
    risk: "low",
    href: "/app/farmers",
    recentActivity: "Approved KES 84,000 · 09:42",
  },
  {
    id: "f-002",
    type: "farmer",
    title: "Peter Ochieng",
    subtitle: "Dairy · 2.4 ha",
    location: "Kisumu",
    status: "Application pending",
    risk: "medium",
    href: "/app/farmers",
    recentActivity: "Climate flag raised · yesterday",
  },
  {
    id: "l-4412",
    type: "loan",
    title: "Loan LES-4412",
    subtitle: "KES 120,000 · 18 months",
    location: "Machakos",
    status: "Under review",
    risk: "medium",
    href: "/app/decisions",
    recentActivity: "Officer override logged",
  },
  {
    id: "c-mwea",
    type: "cooperative",
    title: "Mwea Irrigation Cooperative",
    subtitle: "312 members · rice",
    location: "Kirinyaga",
    status: "Graph cluster",
    risk: "very-low",
    href: "/app/graph",
    recentActivity: "12 farmers linked · 09:14",
  },
  {
    id: "co-nakuru",
    type: "county",
    title: "Nakuru County",
    subtitle: "3,420 farmers in portfolio",
    location: "Rift Valley",
    status: "Climate watch",
    risk: "medium",
    href: "/app/climate",
    recentActivity: "Rainfall variance +14%",
  },
  {
    id: "co-nyandarua",
    type: "county",
    title: "Nyandarua County",
    subtitle: "1,892 farmers · 14 cooperatives",
    location: "Central",
    status: "Amber alert",
    risk: "medium",
    href: "/app/climate",
    recentActivity: "3 cooperatives flagged",
  },
  {
    id: "d-meru",
    type: "dealer",
    title: "Meru Agro Inputs Ltd",
    subtitle: "Fertilizer + seed distributor",
    location: "Meru",
    status: "Linked to 62 farmers",
    risk: "low",
    href: "/app/graph",
    recentActivity: "Peer cluster detected",
  },
  {
    id: "a-8821",
    type: "application",
    title: "Application APP-8821",
    subtitle: "KES 64,000 · maize inputs",
    location: "Uasin Gishu",
    status: "High confidence",
    risk: "very-low",
    href: "/app/decisions",
    recentActivity: "Score 0.94 · ready to approve",
  },
  {
    id: "r-2291",
    type: "risk",
    title: "Risk ID RSK-2291",
    subtitle: "Climate + repayment composite",
    location: "Makueni",
    status: "Elevated",
    risk: "high",
    href: "/app/portfolio",
    recentActivity: "Exposure 58%",
  },
  {
    id: "d-1044",
    type: "decision",
    title: "Decision DEC-1044",
    subtitle: "Approved with explanation",
    location: "Kiambu",
    status: "Completed",
    risk: "low",
    href: "/app/decisions",
    recentActivity: "Confidence 0.94",
  },
];

export const searchTypeLabels: Record<SearchEntityType, string> = {
  farmer: "Farmers",
  loan: "Loans",
  cooperative: "Cooperatives",
  county: "Counties",
  dealer: "Input dealers",
  application: "Applications",
  risk: "Risk IDs",
  decision: "Decision IDs",
};
