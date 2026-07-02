import type { FarmerProfile, ZkCredential } from "@/api/types";
import { getPersistence } from "@/server/services/persistence";

export async function saveFarmerCredential(
  farmerId: string,
  credential: ZkCredential,
): Promise<FarmerProfile> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) throw new Error("Farmer not found");

  const updated: FarmerProfile = { ...farmer, zkCredential: credential };
  await persistence.upsertFarmer(updated);
  return updated;
}

export async function getFarmerCredential(farmerId: string): Promise<ZkCredential | undefined> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  return farmer?.zkCredential;
}
