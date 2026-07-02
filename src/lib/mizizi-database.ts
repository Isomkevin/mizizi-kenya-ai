import type {
  ActivityItem,
  AgentEvent,
  AnalyticsPayload,
  CountyIntel,
  DashboardInsight,
  DashboardKpi,
  DecisionDetail,
  FarmerProfile,
  GraphPayload,
  MasumiJob,
  QuickAction,
  SearchResult,
  WelcomeSnapshot,
} from "@/api/types";

export interface MiziziDatabase {
  tenantId: string;
  welcome: WelcomeSnapshot;
  kpis: DashboardKpi[];
  riskBands: import("@/api/types").RiskBand[];
  insights: DashboardInsight[];
  activity: ActivityItem[];
  quickActions: QuickAction[];
  counties: CountyIntel[];
  farmers: FarmerProfile[];
  searchIndex: SearchResult[];
  graphs: Record<string, GraphPayload>;
  decisions: DecisionDetail[];
  analytics: AnalyticsPayload;
  graphViews: { id: string; userId: string; name: string; farmerId?: string; filters: string }[];
  masumiJobs: MasumiJob[];
  masumiOrchestratorLastRun?: string;
  agentEvents: AgentEvent[];
}
