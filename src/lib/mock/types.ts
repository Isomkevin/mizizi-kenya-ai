export type RiskLevel = "very-low" | "low" | "medium" | "high" | "critical";

export type SearchEntityType =
  | "farmer"
  | "loan"
  | "cooperative"
  | "county"
  | "dealer"
  | "application"
  | "risk"
  | "decision";

export type ActivityType =
  | "loan-approved"
  | "graph-updated"
  | "climate-refresh"
  | "sms-delivered"
  | "explanation-generated"
  | "officer-override";

export type MapMetric = "risk" | "loanVolume" | "climate" | "approvalRate";
