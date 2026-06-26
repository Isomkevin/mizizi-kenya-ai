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

export type UserRole =
  | "administrator"
  | "credit_manager"
  | "loan_officer"
  | "risk_analyst"
  | "field_officer"
  | "auditor"
  | "data_steward";

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
  farmerId?: string;
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

export interface DashboardPayload {
  welcome: WelcomeSnapshot;
  kpis: DashboardKpi[];
  riskBands: RiskBand[];
  insights: DashboardInsight[];
  activity: ActivityItem[];
  quickActions: QuickAction[];
  counties: CountyIntel[];
}

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

export interface FarmerSummary {
  id: string;
  farmerId: string;
  name: string;
  county: string;
  cooperative: string;
  cropType: string;
  risk: RiskLevel;
  confidence: number;
  verificationStatus: "verified" | "pending" | "unverified";
  decisionStatus: string;
  graphConnections: number;
  climateIndicator: string;
  lastDecision?: string;
  gender?: string;
  loanAmountKes?: number;
  applicationStatus?: string;
}

export interface FarmerProfile extends FarmerSummary {
  phone?: string;
  parcelHa?: number;
  recommendation?: string;
  officerRecommendation?: string;
  dataCompleteness: number;
  sourceFreshness: string;
  trustIndicators: string[];
  contributingFactors: DecisionFactor[];
  repayments: RepaymentRecord[];
  loans: LoanRecord[];
  applications: ApplicationRecord[];
  decisions: DecisionSummary[];
  timeline: TimelineEvent[];
  documents: DocumentRecord[];
  communications: CommunicationRecord[];
  climate: ClimateSnapshot;
}

export interface RepaymentRecord {
  id: string;
  date: string;
  amountKes: number;
  onTime: boolean;
}

export interface LoanRecord {
  id: string;
  amountKes: number;
  status: string;
  termMonths: number;
}

export interface ApplicationRecord {
  id: string;
  amountKes: number;
  status: string;
  cropType: string;
  submittedAt: string;
}

export interface DecisionSummary {
  id: string;
  applicationId: string;
  recommendation: string;
  confidence: number;
  risk: RiskLevel;
  status: "pending" | "approved" | "declined" | "override";
  createdAt: string;
}

export interface DecisionFactor {
  id: string;
  label: string;
  weight: number;
  direction: "positive" | "negative";
  confidence: number;
  source: string;
  graphPath?: string[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  category: string;
  title: string;
  description: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  verificationStatus: string;
  uploadedAt: string;
  source: string;
  ocrStatus: string;
}

export interface CommunicationRecord {
  id: string;
  channel: string;
  message: string;
  status: string;
  timestamp: string;
}

export interface ClimateSnapshot {
  rainfallMm: number;
  droughtProbability: number;
  ndvi: number;
  insight: string;
  observations: { date: string; label: string; value: string }[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  risk?: RiskLevel;
  properties: Record<string, string | number>;
  provenance?: string;
  lastUpdated?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, string | number>;
}

export interface GraphPayload {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DecisionDetail {
  id: string;
  farmerId: string;
  farmerName: string;
  applicationId: string;
  recommendation: "approve" | "approve_with_conditions" | "request_info" | "escalate" | "decline";
  confidence: number;
  risk: RiskLevel;
  status: "pending" | "approved" | "declined" | "override";
  factors: DecisionFactor[];
  positiveSignals: string[];
  negativeSignals: string[];
  officerExplanation: string;
  farmerExplanation: string;
  overrideReason?: string;
  createdAt: string;
}

export interface AnalyticsPayload {
  executive: {
    totalFarmers: number;
    applications: number;
    approvalRate: number;
    portfolioHealth: number;
    avgRisk: number;
    climateExposure: number;
    avgDecisionHours: number;
    graphCoverage: number;
  };
  lending: { month: string; applications: number; approved: number; declined: number }[];
  geographic: CountyIntel[];
  climate: { county: string; rainfall: number; drought: number; ndvi: number }[];
  graph: {
    nodes: number;
    relationships: number;
    communities: number;
    avgDegree: number;
    entityResolutionAccuracy: number;
  };
  explainability: {
    avgGenerationSeconds: number;
    topFactors: { factor: string; count: number }[];
    overrideReasons: { reason: string; count: number }[];
  };
}
