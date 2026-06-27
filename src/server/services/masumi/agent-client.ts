import type { FarmerProfile } from "@/api/types";
import { serverEnv } from "@/server/env";
import { agentPathForType, agentTypeForEnrichType } from "@/server/services/masumi/job-store";

type AgentStartResponse = {
  job_id?: string;
  blockchainIdentifier?: string;
  input_hash?: string;
  status?: string;
};

type AgentStatusResponse = {
  status: string;
  job_id?: string;
  result?: Record<string, unknown>;
  output_hash?: string;
  masumi_tx_hash?: string;
  message?: string;
  progress?: { percentage?: number; current_step?: string };
};

export function isMasumiEnabled(): boolean {
  return serverEnv.masumiMode() !== "disabled";
}

function agentsBaseUrl(): string {
  return serverEnv.masumiAgentsUrl().replace(/\/$/, "");
}

function agentPaths() {
  return {
    climate: serverEnv.masumiClimateAgentPath(),
    coop: serverEnv.masumiCoopAgentPath(),
    mobile: serverEnv.masumiMobileAgentPath(),
    orchestrator: serverEnv.masumiOrchestratorPath(),
  };
}

export async function checkAgentAvailability(
  agentType: ReturnType<typeof agentTypeForEnrichType>,
): Promise<{ status: "available" | "unavailable" | "unknown"; message?: string }> {
  if (!isMasumiEnabled()) {
    return { status: "unknown", message: "Masumi disabled" };
  }
  const path = agentPathForType(agentType, agentPaths());
  try {
    const response = await fetch(`${agentsBaseUrl()}${path}/availability`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { status: "unavailable", message: `HTTP ${response.status}` };
    const json = (await response.json()) as { status?: string; message?: string };
    return {
      status: json.status === "available" ? "available" : "unavailable",
      message: json.message,
    };
  } catch (error) {
    return {
      status: "unavailable",
      message: error instanceof Error ? error.message : "Agent unreachable",
    };
  }
}

export async function startAgentJob(input: {
  agentType: ReturnType<typeof agentTypeForEnrichType>;
  identifierFromPurchaser: string;
  inputData: Array<{ key: string; value: string }>;
}): Promise<AgentStartResponse> {
  const path = agentPathForType(input.agentType, agentPaths());
  const response = await fetch(`${agentsBaseUrl()}${path}/start_job`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      identifier_from_purchaser: input.identifierFromPurchaser,
      input_data: input.inputData,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Agent start_job failed (${response.status}): ${text}`);
  }
  return (await response.json()) as AgentStartResponse;
}

export async function pollAgentJob(
  agentType: ReturnType<typeof agentTypeForEnrichType>,
  jobId: string,
): Promise<AgentStatusResponse> {
  const path = agentPathForType(agentType, agentPaths());
  const response = await fetch(
    `${agentsBaseUrl()}${path}/status?job_id=${encodeURIComponent(jobId)}`,
    {
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) {
    throw new Error(`Agent status failed (${response.status})`);
  }
  return (await response.json()) as AgentStatusResponse;
}

export function buildAgentInputForGap(
  farmer: FarmerProfile,
  gapId: string,
  enrichType: string,
  coords: { lat: number; lon: number },
): Array<{ key: string; value: string }> {
  const cooperativeId = `coop-${farmer.id}`;
  const base = [
    { key: "farmer_id", value: farmer.id },
    { key: "county", value: farmer.county },
    { key: "lat", value: String(coords.lat) },
    { key: "lon", value: String(coords.lon) },
    { key: "cooperative", value: farmer.cooperative },
    { key: "cooperative_id", value: cooperativeId },
  ];

  if (enrichType === "MOBILE_MONEY") {
    return [
      { key: "farmer_id", value: farmer.id },
      {
        key: "consent_token",
        value: farmer.consent?.status === "ACTIVE" ? `consent-${farmer.id}` : "",
      },
    ];
  }

  if (enrichType === "CLIMATE" || gapId === "climate_zone") {
    return base.filter((item) => ["farmer_id", "county", "lat", "lon"].includes(item.key));
  }

  if (enrichType === "COOPERATIVE" || gapId === "repayment" || gapId === "cooperative") {
    return base.filter((item) => ["farmer_id", "cooperative", "cooperative_id"].includes(item.key));
  }

  return base;
}

export async function checkPaymentServiceHealth(): Promise<boolean> {
  if (serverEnv.masumiMode() !== "live") return false;
  const url = serverEnv.masumiPaymentUrl().replace(/\/$/, "");
  try {
    const response = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}
