import type {
  DataGap,
  DataGapId,
  DataGapStatus,
  EnrichmentJob,
  FarmerProfile,
  GraphPayload,
} from "@/api/types";

type SignalSpec = {
  id: DataGapId;
  label: string;
  weight: number;
  severity: DataGap["severity"];
  reason: string;
  suggestedAction: DataGap["suggestedAction"];
  enrichType?: DataGap["enrichType"];
  isPresent: (farmer: FarmerProfile, graph: GraphPayload | null) => boolean;
};

function graphHasNodeType(graph: GraphPayload | null, type: string): boolean {
  return graph?.nodes.some((node) => node.type.toLowerCase() === type.toLowerCase()) ?? false;
}

function graphHasEdgeType(graph: GraphPayload | null, type: string): boolean {
  return graph?.edges.some((edge) => edge.type.toUpperCase() === type.toUpperCase()) ?? false;
}

function hasVerifiedIdentity(farmer: FarmerProfile): boolean {
  if (farmer.verificationStatus === "verified") return true;
  return farmer.documents.some(
    (doc) =>
      doc.type === "identity" &&
      doc.verificationStatus === "verified" &&
      doc.classificationStatus === "confirmed",
  );
}

const SIGNAL_SPECS: SignalSpec[] = [
  {
    id: "identity",
    label: "Verified identity",
    weight: 0.12,
    severity: "critical",
    reason: "National ID or equivalent identity document is not verified.",
    suggestedAction: "upload",
    isPresent: (farmer) => hasVerifiedIdentity(farmer),
  },
  {
    id: "cooperative",
    label: "Cooperative membership",
    weight: 0.2,
    severity: "critical",
    reason: "Cooperative linkage is missing or unconfirmed in the graph.",
    suggestedAction: "enrich_api",
    enrichType: "COOPERATIVE",
    isPresent: (farmer, graph) =>
      Boolean(farmer.cooperative?.trim()) &&
      (graphHasNodeType(graph, "Cooperative") || graphHasEdgeType(graph, "MEMBER_OF")),
  },
  {
    id: "repayment",
    label: "Repayment history",
    weight: 0.2,
    severity: "critical",
    reason: "No repayment events linked to this farmer profile.",
    suggestedAction: "enrich_api",
    enrichType: "COOPERATIVE",
    isPresent: (farmer, graph) =>
      farmer.repayments.length > 0 ||
      (graphHasNodeType(graph, "Loan") && graphHasEdgeType(graph, "OWNS_LOAN")),
  },
  {
    id: "farm_parcel",
    label: "Farm parcel boundary",
    weight: 0.12,
    severity: "important",
    reason: "Parcel size or land document is not linked to the farmer graph.",
    suggestedAction: "upload",
    enrichType: "PARCEL",
    isPresent: (farmer, graph) =>
      (farmer.parcelHa ?? 0) > 0 ||
      farmer.documents.some(
        (doc) => doc.type === "land" && doc.classificationStatus === "confirmed",
      ) ||
      graph?.nodes.some((node) => node.type.toLowerCase().includes("parcel")) === true,
  },
  {
    id: "climate_zone",
    label: "Climate signals",
    weight: 0.1,
    severity: "important",
    reason: "County climate observations are missing or not refreshed.",
    suggestedAction: "enrich_api",
    enrichType: "CLIMATE",
    isPresent: (farmer, graph) =>
      farmer.climate.rainfallMm > 0 && graphHasNodeType(graph, "ClimateZone"),
  },
  {
    id: "input_purchase",
    label: "Input purchase history",
    weight: 0.1,
    severity: "important",
    reason: "No input dealer relationship recorded for purchase regularity scoring.",
    suggestedAction: "enrich_api",
    enrichType: "COOPERATIVE",
    isPresent: (farmer, graph) =>
      graphHasNodeType(graph, "InputDealer") && graphHasEdgeType(graph, "PURCHASES_FROM"),
  },
  {
    id: "mobile_activity",
    label: "Mobile money activity",
    weight: 0.06,
    severity: "optional",
    reason: "Mobile wallet regularity signal is not linked (consent may be required).",
    suggestedAction: "farmer_consent",
    enrichType: "MOBILE_MONEY",
    isPresent: (farmer) =>
      farmer.trustIndicators.some((item) => /mobile|wallet|mpesa/i.test(item)) ||
      farmer.communications.some((item) => item.channel === "sms"),
  },
  {
    id: "graph_coverage",
    label: "Graph neighbourhood coverage",
    weight: 0.1,
    severity: "optional",
    reason: "Graph has fewer than three relationship types — neighbourhood context is thin.",
    suggestedAction: "officer_input",
    isPresent: (farmer, graph) => {
      const edgeTypes = new Set(graph?.edges.map((edge) => edge.type) ?? []);
      return farmer.graphConnections >= 3 && edgeTypes.size >= 3;
    },
  },
];

function gapStatus(spec: SignalSpec, present: boolean, jobs: EnrichmentJob[]): DataGapStatus {
  if (present) return "present";
  const pending = jobs.some(
    (job) => job.gapId === spec.id && (job.status === "queued" || job.status === "running"),
  );
  if (pending) return "pending_enrichment";
  return "missing";
}

export function detectDataGaps(
  farmer: FarmerProfile,
  graph: GraphPayload | null,
  jobs: EnrichmentJob[] = farmer.enrichmentJobs ?? [],
): DataGap[] {
  return SIGNAL_SPECS.map((spec) => {
    const present = spec.isPresent(farmer, graph);
    return {
      id: spec.id,
      label: spec.label,
      severity: spec.severity,
      weight: spec.weight,
      status: gapStatus(spec, present, jobs),
      reason: present ? `${spec.label} is linked.` : spec.reason,
      suggestedAction: spec.suggestedAction,
      enrichType: spec.enrichType,
    };
  });
}

export function computeCompletenessFromGaps(gaps: DataGap[]): number {
  const presentWeight = gaps
    .filter((gap) => gap.status === "present" || gap.status === "pending_enrichment")
    .reduce((sum, gap) => sum + gap.weight, 0);
  return Math.min(1, Math.max(0, presentWeight));
}

export function deriveEnrichmentStatus(
  gaps: DataGap[],
  jobs: EnrichmentJob[] = [],
): FarmerProfile["enrichmentStatus"] {
  const missing = gaps.filter((gap) => gap.status === "missing");
  if (missing.length === 0) return "complete";

  const activeJobs = jobs.filter((job) => job.status === "queued" || job.status === "running");
  if (activeJobs.length > 0) return "in_progress";
  if (jobs.some((job) => job.status === "queued")) return "requested";
  return missing.length > 0 ? "none" : "complete";
}

export function missingDataGaps(gaps: DataGap[]): DataGap[] {
  return gaps.filter((gap) => gap.status === "missing" || gap.status === "stale");
}
