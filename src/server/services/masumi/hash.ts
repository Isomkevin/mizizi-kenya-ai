import { createHash } from "node:crypto";

export function canonicalHash(data: unknown): string {
  const canonical = JSON.stringify(data, Object.keys(data as object).sort());
  return createHash("sha256").update(canonical).digest("hex");
}

export function masumiPurchaserId(farmerId: string, gapId?: string): string {
  const base = `${farmerId}-${gapId ?? "all"}-${Date.now()}`;
  return createHash("sha256").update(base).digest("hex").slice(0, 24);
}
