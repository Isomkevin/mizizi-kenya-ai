/** Shared ID normalization for seed data, fallbacks, and marketing links. */
const FARMER_ID_ALIASES: Record<string, string> = {
  "farmer-001": "f-001",
  "farmer-002": "f-002",
  "farmer-003": "f-003",
  "F-10384": "f-003",
  "F001-NAK-2026": "f-001",
  "F002-KIS-2026": "f-002",
};

const DECISION_ID_ALIASES: Record<string, string> = {
  "dec-041": "dec-f-002",
  "decision-041": "dec-f-002",
  "DEC-1044": "dec-f-001",
  "d-1044": "dec-f-001",
};

export function normalizeFarmerId(id: string): string {
  const trimmed = id.trim();
  return FARMER_ID_ALIASES[trimmed] ?? FARMER_ID_ALIASES[trimmed.toLowerCase()] ?? trimmed;
}

export function normalizeDecisionId(id: string): string {
  const trimmed = id.trim();
  if (DECISION_ID_ALIASES[trimmed]) return DECISION_ID_ALIASES[trimmed];
  if (trimmed.startsWith("decision-")) {
    return trimmed.replace(/^decision-/, "dec-");
  }
  return trimmed;
}
