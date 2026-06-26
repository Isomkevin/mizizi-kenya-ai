import type {
  AnalyticsPayload,
  ClimateSnapshot,
  CommunicationRecord,
  DecisionDetail,
  DecisionFactor,
  DocumentRecord,
  FarmerProfile,
  GraphPayload,
  SearchResult,
  TimelineEvent,
} from "@/api/types";
import {
  countyIntel,
  dashboardInsights,
  dashboardKpis,
  quickActions,
  recentActivity,
  riskBands,
  welcomeSnapshot,
} from "@/lib/mock/dashboard";
import { searchIndex as mockSearchIndex } from "@/lib/mock/search";
import type { MiziziDatabase } from "@/server/db/local-store";

const TENANT_ID = "lesom-sandbox";

type FarmerSeed = {
  id: string;
  farmerId: string;
  name: string;
  county: string;
  cooperative: string;
  cropType: string;
  risk: FarmerProfile["risk"];
  confidence: number;
  verificationStatus: FarmerProfile["verificationStatus"];
  decisionStatus: string;
  graphConnections: number;
  climateIndicator: string;
  gender: string;
  loanAmountKes: number;
  applicationStatus: string;
  parcelHa: number;
  recommendation: string;
  officerRecommendation: string;
  trustIndicators: string[];
  dataCompleteness: number;
  sourceFreshness: string;
  phone: string;
};

function factor(
  id: string,
  label: string,
  weight: number,
  direction: "positive" | "negative",
  source: string,
  confidence = 0.9,
): DecisionFactor {
  return {
    id,
    label,
    weight,
    direction,
    confidence,
    source,
  };
}

function buildClimate(seed: FarmerSeed, index: number): ClimateSnapshot {
  return {
    rainfallMm: 65 + index * 3,
    droughtProbability: Math.min(0.65, 0.18 + index * 0.02),
    ndvi: 0.44 + (index % 4) * 0.07,
    insight: `${seed.county} climate signal indicates ${seed.climateIndicator.toLowerCase()} conditions.`,
    observations: [
      { date: "2026-06-10", label: "Rainfall", value: `${60 + index * 2} mm` },
      { date: "2026-06-14", label: "NDVI", value: (0.4 + (index % 5) * 0.06).toFixed(2) },
      {
        date: "2026-06-20",
        label: "Drought risk",
        value: `${Math.round((0.15 + index * 0.02) * 100)}%`,
      },
    ],
  };
}

function buildTimeline(seed: FarmerSeed): TimelineEvent[] {
  return [
    {
      id: `${seed.id}-tl-1`,
      timestamp: "2026-06-03T08:30:00Z",
      category: "application",
      title: "Application submitted",
      description: `Submitted ${seed.cropType.toLowerCase()} seasonal input application.`,
    },
    {
      id: `${seed.id}-tl-2`,
      timestamp: "2026-06-08T11:00:00Z",
      category: "graph",
      title: "Graph enrichment complete",
      description: `Linked cooperative and input dealer records for ${seed.name}.`,
    },
    {
      id: `${seed.id}-tl-3`,
      timestamp: "2026-06-12T10:10:00Z",
      category: "decision",
      title: "Credit recommendation generated",
      description: `Model generated ${seed.decisionStatus.toLowerCase()} recommendation with explainability.`,
    },
  ];
}

function buildDocuments(seed: FarmerSeed): DocumentRecord[] {
  return [
    {
      id: `${seed.id}-doc-1`,
      name: "National ID",
      type: "identity",
      verificationStatus: "verified",
      uploadedAt: "2026-06-02T07:00:00Z",
      source: "field_officer_app",
      ocrStatus: "complete",
    },
    {
      id: `${seed.id}-doc-2`,
      name: "Farm ownership affidavit",
      type: "land_record",
      verificationStatus: "verified",
      uploadedAt: "2026-06-02T07:05:00Z",
      source: "cooperative_portal",
      ocrStatus: "complete",
    },
    {
      id: `${seed.id}-doc-3`,
      name: "Input quotation",
      type: "quotation",
      verificationStatus: "pending_review",
      uploadedAt: "2026-06-03T09:20:00Z",
      source: "dealer_upload",
      ocrStatus: "complete",
    },
  ];
}

function buildCommunications(seed: FarmerSeed): CommunicationRecord[] {
  return [
    {
      id: `${seed.id}-com-1`,
      channel: "sms",
      message: "Application received. Mizizi risk screening in progress.",
      status: "delivered",
      timestamp: "2026-06-03T09:00:00Z",
    },
    {
      id: `${seed.id}-com-2`,
      channel: "ussd",
      message: `Repayment reminder sent to ${seed.phone}.`,
      status: "delivered",
      timestamp: "2026-06-16T06:45:00Z",
    },
  ];
}

function buildProfile(seed: FarmerSeed, index: number): FarmerProfile {
  const applicationId = `app-${seed.id}`;
  const decisionId = `dec-${seed.id}`;
  const loanId = `ln-${seed.id}`;
  return {
    id: seed.id,
    farmerId: seed.farmerId,
    name: seed.name,
    county: seed.county,
    cooperative: seed.cooperative,
    cropType: seed.cropType,
    risk: seed.risk,
    confidence: seed.confidence,
    verificationStatus: seed.verificationStatus,
    decisionStatus: seed.decisionStatus,
    graphConnections: seed.graphConnections,
    climateIndicator: seed.climateIndicator,
    lastDecision: "2026-06-12",
    gender: seed.gender,
    loanAmountKes: seed.loanAmountKes,
    applicationStatus: seed.applicationStatus,
    phone: seed.phone,
    parcelHa: seed.parcelHa,
    recommendation: seed.recommendation,
    officerRecommendation: seed.officerRecommendation,
    dataCompleteness: seed.dataCompleteness,
    sourceFreshness: seed.sourceFreshness,
    trustIndicators: seed.trustIndicators,
    contributingFactors: [
      factor(`${seed.id}-f1`, "Repayment consistency", 0.33, "positive", "loan_history", 0.95),
      factor(`${seed.id}-f2`, "Cooperative centrality", 0.24, "positive", "graph_score", 0.9),
      factor(`${seed.id}-f3`, "Climate volatility", 0.21, "negative", "climate_signal", 0.88),
      factor(
        `${seed.id}-f4`,
        "Input dealer concentration",
        0.15,
        "negative",
        "network_pattern",
        0.84,
      ),
      factor(`${seed.id}-f5`, "Data freshness", 0.07, "positive", "platform_metadata", 0.93),
    ],
    repayments: [
      { id: `${seed.id}-rp-1`, date: "2026-04-08", amountKes: 12000 + index * 350, onTime: true },
      { id: `${seed.id}-rp-2`, date: "2026-05-08", amountKes: 12000 + index * 350, onTime: true },
      {
        id: `${seed.id}-rp-3`,
        date: "2026-06-08",
        amountKes: 12000 + index * 350,
        onTime: seed.risk !== "high" && seed.risk !== "critical",
      },
    ],
    loans: [
      {
        id: loanId,
        amountKes: seed.loanAmountKes,
        status: seed.decisionStatus === "Approved" ? "active" : "under_review",
        termMonths: 18,
      },
    ],
    applications: [
      {
        id: applicationId,
        amountKes: seed.loanAmountKes,
        status: seed.applicationStatus,
        cropType: seed.cropType,
        submittedAt: "2026-06-03T08:30:00Z",
      },
    ],
    decisions: [
      {
        id: decisionId,
        applicationId,
        recommendation: seed.recommendation,
        confidence: seed.confidence,
        risk: seed.risk,
        status:
          seed.decisionStatus === "Approved"
            ? "approved"
            : seed.decisionStatus === "Declined"
              ? "declined"
              : "pending",
        createdAt: "2026-06-12T10:10:00Z",
      },
    ],
    timeline: buildTimeline(seed),
    documents: buildDocuments(seed),
    communications: buildCommunications(seed),
    climate: buildClimate(seed, index),
  };
}

const farmerSeeds: FarmerSeed[] = [
  {
    id: "f-001",
    farmerId: "LES-1001",
    name: "Wanjiru Kamau",
    county: "Kiambu",
    cooperative: "Limuru Growers Cooperative",
    cropType: "Maize + Beans",
    risk: "low",
    confidence: 0.94,
    verificationStatus: "verified",
    decisionStatus: "Approved",
    graphConnections: 11,
    climateIndicator: "Stable rainfall",
    gender: "female",
    loanAmountKes: 84000,
    applicationStatus: "approved",
    parcelHa: 2.1,
    recommendation: "approve",
    officerRecommendation: "Approve without conditions",
    trustIndicators: ["Verified ID", "Consistent repayments", "Strong cooperative score"],
    dataCompleteness: 96,
    sourceFreshness: "4h ago",
    phone: "+254700000001",
  },
  {
    id: "f-002",
    farmerId: "LES-1002",
    name: "Peter Ochieng",
    county: "Kisumu",
    cooperative: "Nyando Dairy Collective",
    cropType: "Dairy",
    risk: "medium",
    confidence: 0.82,
    verificationStatus: "verified",
    decisionStatus: "Pending",
    graphConnections: 9,
    climateIndicator: "Moderate variability",
    gender: "male",
    loanAmountKes: 120000,
    applicationStatus: "under_review",
    parcelHa: 2.4,
    recommendation: "approve_with_conditions",
    officerRecommendation: "Approve with insured-input condition",
    trustIndicators: ["Mobile repayment trail", "Cooperative references"],
    dataCompleteness: 89,
    sourceFreshness: "7h ago",
    phone: "+254700000002",
  },
  {
    id: "f-003",
    farmerId: "LES-1003",
    name: "Faith Njeri",
    county: "Nyandarua",
    cooperative: "Aberdare Potato Union",
    cropType: "Potato",
    risk: "high",
    confidence: 0.74,
    verificationStatus: "pending",
    decisionStatus: "Pending",
    graphConnections: 8,
    climateIndicator: "High rainfall variance",
    gender: "female",
    loanAmountKes: 98000,
    applicationStatus: "under_review",
    parcelHa: 1.6,
    recommendation: "request_info",
    officerRecommendation: "Need additional guarantor details",
    trustIndicators: ["Partial title verification"],
    dataCompleteness: 78,
    sourceFreshness: "1d ago",
    phone: "+254700000003",
  },
  {
    id: "f-004",
    farmerId: "LES-1004",
    name: "James Otieno",
    county: "Machakos",
    cooperative: "Athi River Horticulture Coop",
    cropType: "Tomato",
    risk: "medium",
    confidence: 0.79,
    verificationStatus: "verified",
    decisionStatus: "Pending",
    graphConnections: 10,
    climateIndicator: "Rising heat stress",
    gender: "male",
    loanAmountKes: 110000,
    applicationStatus: "under_review",
    parcelHa: 1.9,
    recommendation: "approve_with_conditions",
    officerRecommendation: "Approve with irrigation compliance check",
    trustIndicators: ["Dealer payment consistency", "Extension officer endorsement"],
    dataCompleteness: 87,
    sourceFreshness: "11h ago",
    phone: "+254700000004",
  },
  {
    id: "f-005",
    farmerId: "LES-1005",
    name: "Mary Akinyi",
    county: "Kakamega",
    cooperative: "Lurambi Cane & Maize Coop",
    cropType: "Sugarcane + Maize",
    risk: "low",
    confidence: 0.91,
    verificationStatus: "verified",
    decisionStatus: "Approved",
    graphConnections: 12,
    climateIndicator: "Favorable moisture",
    gender: "female",
    loanAmountKes: 76000,
    applicationStatus: "approved",
    parcelHa: 2.7,
    recommendation: "approve",
    officerRecommendation: "Approve",
    trustIndicators: ["3 successful cycles", "Strong peer references"],
    dataCompleteness: 94,
    sourceFreshness: "6h ago",
    phone: "+254700000005",
  },
  {
    id: "f-006",
    farmerId: "LES-1006",
    name: "Samuel Kiptoo",
    county: "Uasin Gishu",
    cooperative: "Eldoret Grain Cooperative",
    cropType: "Maize",
    risk: "very-low",
    confidence: 0.96,
    verificationStatus: "verified",
    decisionStatus: "Approved",
    graphConnections: 15,
    climateIndicator: "Stable season outlook",
    gender: "male",
    loanAmountKes: 132000,
    applicationStatus: "approved",
    parcelHa: 3.4,
    recommendation: "approve",
    officerRecommendation: "Fast-track approval",
    trustIndicators: [
      "Excellent repayment score",
      "High graph confidence",
      "Stable climate signal",
    ],
    dataCompleteness: 98,
    sourceFreshness: "2h ago",
    phone: "+254700000006",
  },
  {
    id: "f-007",
    farmerId: "LES-1007",
    name: "Beatrice Wambui",
    county: "Meru",
    cooperative: "Igembe Miraa Collective",
    cropType: "Miraa",
    risk: "medium",
    confidence: 0.81,
    verificationStatus: "verified",
    decisionStatus: "Pending",
    graphConnections: 7,
    climateIndicator: "Localized dry pockets",
    gender: "female",
    loanAmountKes: 69000,
    applicationStatus: "under_review",
    parcelHa: 1.2,
    recommendation: "approve_with_conditions",
    officerRecommendation: "Approve with climate advisory enrollment",
    trustIndicators: ["Verified cooperative relation", "Good extension attendance"],
    dataCompleteness: 85,
    sourceFreshness: "12h ago",
    phone: "+254700000007",
  },
  {
    id: "f-008",
    farmerId: "LES-1008",
    name: "David Mutiso",
    county: "Makueni",
    cooperative: "Kathonzweni Green Coop",
    cropType: "Green Gram",
    risk: "high",
    confidence: 0.7,
    verificationStatus: "pending",
    decisionStatus: "Declined",
    graphConnections: 6,
    climateIndicator: "Severe moisture stress",
    gender: "male",
    loanAmountKes: 58000,
    applicationStatus: "declined",
    parcelHa: 1.5,
    recommendation: "decline",
    officerRecommendation: "Decline pending irrigation proof",
    trustIndicators: ["USSD repayment prompts acknowledged"],
    dataCompleteness: 74,
    sourceFreshness: "2d ago",
    phone: "+254700000008",
  },
  {
    id: "f-009",
    farmerId: "LES-1009",
    name: "Rose Chebet",
    county: "Trans Nzoia",
    cooperative: "Kitale Mixed Farmers Coop",
    cropType: "Wheat + Maize",
    risk: "low",
    confidence: 0.9,
    verificationStatus: "verified",
    decisionStatus: "Approved",
    graphConnections: 10,
    climateIndicator: "Mild wet anomaly",
    gender: "female",
    loanAmountKes: 125000,
    applicationStatus: "approved",
    parcelHa: 3.0,
    recommendation: "approve",
    officerRecommendation: "Approve",
    trustIndicators: ["Positive savings trend", "Dealer history verified"],
    dataCompleteness: 93,
    sourceFreshness: "5h ago",
    phone: "+254700000009",
  },
  {
    id: "f-010",
    farmerId: "LES-1010",
    name: "Anthony Mwangi",
    county: "Nakuru",
    cooperative: "Njoro Agro Producers",
    cropType: "Dairy + Fodder",
    risk: "medium",
    confidence: 0.84,
    verificationStatus: "verified",
    decisionStatus: "Pending",
    graphConnections: 8,
    climateIndicator: "Rainfall volatility",
    gender: "male",
    loanAmountKes: 104000,
    applicationStatus: "under_review",
    parcelHa: 2.2,
    recommendation: "request_info",
    officerRecommendation: "Need latest milk contract statements",
    trustIndicators: ["Consistent M-Pesa cashflow"],
    dataCompleteness: 86,
    sourceFreshness: "9h ago",
    phone: "+254700000010",
  },
  {
    id: "f-011",
    farmerId: "LES-1011",
    name: "Lucy Wairimu",
    county: "Kirinyaga",
    cooperative: "Mwea Irrigation Cooperative",
    cropType: "Rice",
    risk: "very-low",
    confidence: 0.97,
    verificationStatus: "verified",
    decisionStatus: "Approved",
    graphConnections: 14,
    climateIndicator: "Irrigation-buffered",
    gender: "female",
    loanAmountKes: 117000,
    applicationStatus: "approved",
    parcelHa: 2.8,
    recommendation: "approve",
    officerRecommendation: "Approve",
    trustIndicators: ["Irrigation access", "Strong repayment baseline", "Peer cluster stability"],
    dataCompleteness: 99,
    sourceFreshness: "1h ago",
    phone: "+254700000011",
  },
  {
    id: "f-012",
    farmerId: "LES-1012",
    name: "Hassan Ali",
    county: "Mombasa",
    cooperative: "Coastal Fresh Produce Group",
    cropType: "Vegetables",
    risk: "medium",
    confidence: 0.8,
    verificationStatus: "verified",
    decisionStatus: "Pending",
    graphConnections: 7,
    climateIndicator: "Flood pulse risk",
    gender: "male",
    loanAmountKes: 66000,
    applicationStatus: "under_review",
    parcelHa: 1.1,
    recommendation: "escalate",
    officerRecommendation: "Escalate for manual review",
    trustIndicators: ["Verified ID", "Coastal market contracts"],
    dataCompleteness: 83,
    sourceFreshness: "8h ago",
    phone: "+254700000012",
  },
];

function buildFarmerGraph(farmer: FarmerProfile): GraphPayload {
  const cooperativeId = `coop-${farmer.id}`;
  const loanId = `loan-${farmer.id}`;
  const dealerId = `dealer-${farmer.id}`;
  const climateZoneId = `zone-${farmer.county.toLowerCase().replace(/\s+/g, "-")}`;
  return {
    nodes: [
      {
        id: farmer.id,
        label: farmer.name,
        type: "Farmer",
        risk: farmer.risk,
        properties: {
          farmerId: farmer.farmerId,
          county: farmer.county,
          confidence: farmer.confidence,
        },
        provenance: "seed",
        lastUpdated: "2026-06-27T00:00:00Z",
      },
      {
        id: cooperativeId,
        label: farmer.cooperative,
        type: "Cooperative",
        properties: { county: farmer.county, role: "producer_group" },
      },
      {
        id: loanId,
        label: `Loan ${farmer.loanAmountKes.toLocaleString()}`,
        type: "Loan",
        properties: { amountKes: farmer.loanAmountKes, status: farmer.applicationStatus },
      },
      {
        id: dealerId,
        label: `${farmer.county} Input Dealer`,
        type: "InputDealer",
        properties: { county: farmer.county, reliabilityScore: 0.86 },
      },
      {
        id: climateZoneId,
        label: `${farmer.county} Climate Zone`,
        type: "ClimateZone",
        properties: { droughtProbability: farmer.climate.droughtProbability },
      },
    ],
    edges: [
      { id: `${farmer.id}-e1`, source: farmer.id, target: cooperativeId, type: "MEMBER_OF" },
      { id: `${farmer.id}-e2`, source: farmer.id, target: loanId, type: "OWNS_LOAN" },
      { id: `${farmer.id}-e3`, source: farmer.id, target: dealerId, type: "PURCHASES_FROM" },
      { id: `${farmer.id}-e4`, source: farmer.id, target: climateZoneId, type: "LOCATED_IN" },
      { id: `${farmer.id}-e5`, source: cooperativeId, target: dealerId, type: "WORKS_WITH" },
    ],
  };
}

function buildDecisions(farmers: FarmerProfile[]): DecisionDetail[] {
  return farmers.slice(0, 6).map((farmer, index) => {
    const baseRecommendation: DecisionDetail["recommendation"][] = [
      "approve",
      "approve_with_conditions",
      "request_info",
      "escalate",
      "decline",
      "approve",
    ];
    const statuses: DecisionDetail["status"][] = [
      "approved",
      "pending",
      "pending",
      "override",
      "declined",
      "pending",
    ];
    return {
      id: `decision-${farmer.id}`,
      farmerId: farmer.id,
      farmerName: farmer.name,
      applicationId: `app-${farmer.id}`,
      recommendation: baseRecommendation[index],
      confidence: Number((farmer.confidence - index * 0.02).toFixed(2)),
      risk: farmer.risk,
      status: statuses[index],
      factors: farmer.contributingFactors,
      positiveSignals: [
        "Verified identity and cooperative membership",
        "Recent repayment consistency",
        "Complete explainability trace",
      ],
      negativeSignals: [
        "Climate volatility on county baseline",
        "Input dealer dependency concentration",
      ],
      officerExplanation: `Decision prepared for ${farmer.name} using risk, climate, and graph evidence.`,
      farmerExplanation:
        "Your application outcome is based on repayment behavior, farm profile, and current climate expectations.",
      overrideReason:
        statuses[index] === "override"
          ? "Officer verified additional collateral off-platform."
          : undefined,
      createdAt: `2026-06-${12 + index}T10:30:00Z`,
    };
  });
}

function buildAnalytics(farmers: FarmerProfile[]): AnalyticsPayload {
  const approved = farmers.filter((farmer) => farmer.applicationStatus === "approved").length;
  return {
    executive: {
      totalFarmers: farmers.length,
      applications: farmers.length,
      approvalRate: Number(((approved / farmers.length) * 100).toFixed(1)),
      portfolioHealth: 88.4,
      avgRisk: 2.3,
      climateExposure: 36.8,
      avgDecisionHours: 4.1,
      graphCoverage: 97.2,
    },
    lending: [
      { month: "Jan", applications: 124, approved: 91, declined: 33 },
      { month: "Feb", applications: 138, approved: 106, declined: 32 },
      { month: "Mar", applications: 151, approved: 114, declined: 37 },
      { month: "Apr", applications: 169, approved: 130, declined: 39 },
      { month: "May", applications: 182, approved: 143, declined: 39 },
      { month: "Jun", applications: 196, approved: 154, declined: 42 },
    ],
    geographic: countyIntel,
    climate: countyIntel.map((county) => ({
      county: county.name,
      rainfall: county.loanVolumeM * 1.1,
      drought: county.climateExposure,
      ndvi: Number((0.38 + (100 - county.climateExposure) / 220).toFixed(2)),
    })),
    graph: {
      nodes: farmers.length * 5,
      relationships: farmers.length * 5,
      communities: 9,
      avgDegree: 4.6,
      entityResolutionAccuracy: 0.96,
    },
    explainability: {
      avgGenerationSeconds: 2.9,
      topFactors: [
        { factor: "Repayment consistency", count: 92 },
        { factor: "Climate volatility", count: 81 },
        { factor: "Cooperative centrality", count: 74 },
        { factor: "Input dealer dependency", count: 59 },
      ],
      overrideReasons: [
        { reason: "Additional collateral", count: 8 },
        { reason: "Field officer verification", count: 5 },
        { reason: "Emergency crop support", count: 3 },
      ],
    },
  };
}

export function buildSeedDatabase(): MiziziDatabase {
  const farmers = farmerSeeds.map((seed, index) => buildProfile(seed, index));
  const graphs = Object.fromEntries(farmers.map((farmer) => [farmer.id, buildFarmerGraph(farmer)]));
  const decisions = buildDecisions(farmers);
  const analytics = buildAnalytics(farmers);
  const searchIndex: SearchResult[] = mockSearchIndex.map((entry) =>
    entry.type === "farmer" ? { ...entry, href: `/app/farmers/${entry.id}` } : entry,
  );

  return {
    tenantId: TENANT_ID,
    welcome: welcomeSnapshot,
    kpis: dashboardKpis,
    riskBands,
    insights: dashboardInsights,
    activity: recentActivity.map((item) => ({
      ...item,
      farmerId: item.id === "act-1" ? "f-001" : undefined,
    })),
    quickActions,
    counties: countyIntel,
    farmers,
    searchIndex,
    graphs,
    decisions,
    analytics,
    graphViews: [
      {
        id: "view-1",
        userId: "officer-kevin",
        name: "Mwea cluster watch",
        farmerId: "f-011",
        filters: JSON.stringify({ depth: 2, risk: ["low", "medium"] }),
      },
      {
        id: "view-2",
        userId: "risk-grace",
        name: "High climate exposure",
        filters: JSON.stringify({ climateExposureMin: 45 }),
      },
    ],
  };
}
