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

export interface CreateFarmerInput {
  name: string;
  farmerId: string;
  phone?: string;
  county: string;
  cooperative: string;
  cropType: string;
}

export type DataGapId =
  | "identity"
  | "cooperative"
  | "repayment"
  | "farm_parcel"
  | "climate_zone"
  | "input_purchase"
  | "mobile_activity"
  | "graph_coverage";

export type DataGapStatus = "present" | "missing" | "pending_enrichment" | "stale";

export type DataGapAction = "upload" | "enrich_api" | "officer_input" | "farmer_consent";

export type EnrichDataType = "COOPERATIVE" | "CLIMATE" | "MOBILE_MONEY" | "PARCEL";

export type EnrichmentStatus = "none" | "requested" | "in_progress" | "complete";

export interface DataGap {
  id: DataGapId;
  label: string;
  severity: "critical" | "important" | "optional";
  weight: number;
  status: DataGapStatus;
  reason: string;
  suggestedAction: DataGapAction;
  enrichType?: EnrichDataType;
}

export interface EnrichmentJob {
  id: string;
  gapId: DataGapId;
  enrichType: EnrichDataType;
  status: "queued" | "running" | "complete" | "failed";
  requestedAt: string;
  requestedBy: "officer" | "system";
  message?: string;
  masumiJobId?: string;
  agentJobId?: string;
  masumiTxHash?: string;
}

export type MasumiJobStatus =
  | "DISPATCHED"
  | "AWAITING_PAYMENT"
  | "RUNNING"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED";

export type MasumiAgentType =
  | "mizizi-orchestrator"
  | "mizizi-climate-data"
  | "mizizi-coop-data"
  | "mizizi-mpesa-proxy";

export type ConsentStatus = "NONE" | "PENDING" | "ACTIVE" | "REVOKED";

export interface ConsentRecord {
  status: ConsentStatus;
  grantedAt?: string;
  revokedAt?: string;
  scope: string[];
  season: string;
}

export interface MasumiJob {
  id: string;
  farmerId: string;
  gapId?: DataGapId;
  enrichType: EnrichDataType | "ORCHESTRATION";
  agentType: MasumiAgentType;
  agentJobId?: string;
  blockchainIdentifier?: string;
  masumiTxHash?: string;
  inputHash?: string;
  outputHash?: string;
  status: MasumiJobStatus;
  requestedAt: string;
  requestedBy: "officer" | "system";
  completedAt?: string;
  error?: string;
  resultSummary?: string;
}

export interface MasumiAgentHealth {
  agentType: MasumiAgentType;
  route: string;
  status: "available" | "unavailable" | "unknown";
  message?: string;
}

export interface MasumiAgentsStatusPayload {
  mode: "demo" | "live" | "disabled";
  paymentConnected: boolean;
  agents: MasumiAgentHealth[];
  jobsCompleted24h: number;
  jobsPending: number;
  orchestratorLastRun?: string;
}

export interface RequestEnrichmentInput {
  farmerId: string;
  gapIds?: DataGapId[];
}

export interface FarmerProfile extends FarmerSummary {
  phone?: string;
  parcelHa?: number;
  recommendation?: string;
  officerRecommendation?: string;
  dataCompleteness: number;
  dataGaps?: DataGap[];
  enrichmentStatus?: EnrichmentStatus;
  enrichmentJobs?: EnrichmentJob[];
  consent?: ConsentRecord;
  insufficientData?: boolean;
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
  zkCredential?: ZkCredential;
}

export interface ZkCredential {
  farmerCommitment: string;
  tier: 1 | 2 | 3 | 4;
  tierLabel: string;
  rawScore: number;
  maxUsdc: number;
  validUntil: string;
  issuedAt: string;
  stellarTxHash?: string;
  explorerUrl?: string;
  mode: "live" | "demo";
}

export interface ZkCredentialStatus {
  farmerId: string;
  credential?: ZkCredential;
  canProve: boolean;
  message?: string;
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

export interface GraphEvidenceStep {
  nodeId: string;
  label: string;
  type: string;
  relationship?: string;
}

export interface DecisionFactor {
  id: string;
  label: string;
  weight: number;
  direction: "positive" | "negative";
  confidence: number;
  source: string;
  graphPath?: string[];
  graphEvidence?: GraphEvidenceStep[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  category: string;
  title: string;
  description: string;
}

export type FarmerDocumentType =
  | "identity"
  | "land_record"
  | "farm_photo"
  | "loan_agreement"
  | "insurance"
  | "satellite_report"
  | "cooperative_membership"
  | "quotation"
  | "other";

export type DocumentIngestionStatus = "processing" | "complete" | "failed";

export type IngestionLlmProvider = "featherless" | "openrouter" | "rules";

export type DocumentClassificationStatus = "pending_review" | "confirmed";

export interface DocumentRecord {
  id: string;
  name: string;
  type: FarmerDocumentType | string;
  verificationStatus: string;
  uploadedAt: string;
  source: string;
  ocrStatus: string;
  mimeType?: string;
  sizeBytes?: number;
  storagePath?: string;
  ingestionStatus?: DocumentIngestionStatus;
  classificationStatus?: DocumentClassificationStatus;
  detectedType?: FarmerDocumentType;
  classificationConfidence?: number;
  ocrConfidence?: number;
  extractionProvider?: IngestionLlmProvider;
  graphSyncStatus?: "pending" | "synced" | "failed";
  extractedFields?: Record<string, string | number>;
  extractedEntities?: Array<{ type: string; name: string; confidence: number }>;
  errorMessage?: string;
}

export interface UploadFarmerDocumentInput {
  farmerId: string;
  fileName: string;
  mimeType: string;
  contentBase64: string;
}

export interface ConfirmFarmerDocumentInput {
  farmerId: string;
  documentId: string;
}

export interface ReclassifyFarmerDocumentInput {
  farmerId: string;
  documentId: string;
  docType: FarmerDocumentType;
}

export interface RemoveFarmerDocumentInput {
  farmerId: string;
  documentId: string;
}

export interface DocumentUploadResult {
  documentId: string;
  farmerId: string;
  ingestionStatus: DocumentIngestionStatus;
}

export interface DocumentExtractionResult {
  documentType: FarmerDocumentType;
  extractedFields: Record<string, string | number>;
  entities: Array<{ type: string; name: string; confidence: number }>;
  ocrConfidence: number;
  verificationHint: "verified" | "pending_review" | "conflict";
  provider: IngestionLlmProvider;
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
  meta?: {
    source: "neo4j" | "local";
    depth?: number;
    syncedAt?: string;
  };
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
  zkCredentialRequired?: boolean;
}

export interface SubmitDecisionInput {
  id: string;
  status: DecisionDetail["status"];
  recommendation: DecisionDetail["recommendation"];
  officerExplanation?: string;
  overrideReason?: string;
}

export interface SubmitDecisionInput {
  id: string;
  status: DecisionDetail["status"];
  recommendation: DecisionDetail["recommendation"];
  officerExplanation?: string;
  overrideReason?: string;
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

export interface RefreshClimateInput {
  county: string;
  lat: number;
  lon: number;
}
