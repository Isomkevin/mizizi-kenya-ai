import type { ConsentRecord, ConsentStatus, FarmerProfile } from "@/api/types";
import { currentSeason } from "@/server/services/masumi/enrichment-apply";
import { getPersistence } from "@/server/services/persistence";

export function hasActiveConsent(farmer: FarmerProfile): boolean {
  const consent = farmer.consent;
  if (!consent || consent.status !== "ACTIVE") return false;
  if (!consent.grantedAt) return false;
  return consent.season === currentSeason();
}

export async function grantFarmerConsent(
  farmerId: string,
  scope: string[] = ["mobile_money", "cooperative_api", "climate"],
): Promise<FarmerProfile> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) {
    throw new Error("Farmer profile not found.");
  }

  const consent: ConsentRecord = {
    status: "ACTIVE",
    grantedAt: new Date().toISOString(),
    scope,
    season: currentSeason(),
  };

  const updated: FarmerProfile = {
    ...farmer,
    consent,
    timeline: [
      {
        id: `${farmerId}-consent-${Date.now()}`,
        timestamp: consent.grantedAt!,
        category: "communication",
        title: "Farmer consent recorded",
        description: `Active consent for ${scope.join(", ")} (${consent.season} season).`,
      },
      ...farmer.timeline,
    ],
  };

  await persistence.upsertFarmer(updated);
  return updated;
}

export async function revokeFarmerConsent(farmerId: string): Promise<FarmerProfile> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) {
    throw new Error("Farmer profile not found.");
  }

  const consent: ConsentRecord = {
    status: "REVOKED",
    grantedAt: farmer.consent?.grantedAt,
    revokedAt: new Date().toISOString(),
    scope: farmer.consent?.scope ?? [],
    season: currentSeason(),
  };

  const updated: FarmerProfile = { ...farmer, consent };
  await persistence.upsertFarmer(updated);
  return updated;
}

export function assertConsentForEnrichType(
  farmer: FarmerProfile,
  enrichType: string,
): { ok: true } | { ok: false; reason: string } {
  if (enrichType === "MOBILE_MONEY" && !hasActiveConsent(farmer)) {
    return { ok: false, reason: "CONSENT_REQUIRED for mobile money enrichment." };
  }
  return { ok: true };
}

export function consentStatusLabel(status: ConsentStatus | undefined): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PENDING":
      return "Pending";
    case "REVOKED":
      return "Revoked";
    default:
      return "Not recorded";
  }
}
