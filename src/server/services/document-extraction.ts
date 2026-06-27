import type {
  DocumentExtractionResult,
  FarmerDocumentType,
  FarmerProfile,
  IngestionLlmProvider,
} from "@/api/types";
import { chatCompletionWithFallback, type ChatMessage } from "@/server/services/llm-client";
import { extractTextFromBuffer, toDataUrl } from "@/server/services/document-storage";

const DOCUMENT_TYPES: FarmerDocumentType[] = [
  "identity",
  "land_record",
  "farm_photo",
  "loan_agreement",
  "insurance",
  "satellite_report",
  "cooperative_membership",
  "quotation",
  "other",
];

const TYPE_LABELS: Record<FarmerDocumentType, string> = {
  identity: "National ID / identity",
  land_record: "Land ownership",
  farm_photo: "Farm photo",
  loan_agreement: "Loan agreement",
  insurance: "Insurance certificate",
  satellite_report: "Satellite report",
  cooperative_membership: "Cooperative membership",
  quotation: "Input quotation",
  other: "Other",
};

function parseJsonBlock(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? text.trim();
  try {
    return JSON.parse(candidate) as Record<string, unknown>;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function normalizeDocType(value: unknown, fallback: FarmerDocumentType): FarmerDocumentType {
  if (typeof value === "string" && DOCUMENT_TYPES.includes(value as FarmerDocumentType)) {
    return value as FarmerDocumentType;
  }
  return fallback;
}

export function inferDocTypeFromFileName(fileName: string, mimeType: string): FarmerDocumentType {
  const lower = fileName.toLowerCase();
  const mime = mimeType.toLowerCase();

  if (
    lower.includes("national") ||
    lower.includes("identity") ||
    /\bid\b/.test(lower) ||
    lower.includes("passport")
  ) {
    return "identity";
  }
  if (
    lower.includes("land") ||
    lower.includes("title") ||
    lower.includes("deed") ||
    lower.includes("parcel")
  ) {
    return "land_record";
  }
  if (lower.includes("coop") || lower.includes("sacco") || lower.includes("membership")) {
    return "cooperative_membership";
  }
  if (lower.includes("loan") || lower.includes("credit") || lower.includes("agreement")) {
    return "loan_agreement";
  }
  if (lower.includes("insurance") || lower.includes("cover")) {
    return "insurance";
  }
  if (lower.includes("satellite") || lower.includes("ndvi") || lower.includes("remote")) {
    return "satellite_report";
  }
  if (lower.includes("quotation") || lower.includes("quote") || lower.includes("invoice")) {
    return "quotation";
  }
  if (
    mime.startsWith("image/") &&
    (lower.includes("farm") || lower.includes("field") || lower.includes("crop"))
  ) {
    return "farm_photo";
  }
  if (mime.startsWith("image/") && !lower.includes("id")) {
    return "farm_photo";
  }

  return "other";
}

function rulesExtraction(fileName: string, farmer: FarmerProfile): DocumentExtractionResult {
  const docType = inferDocTypeFromFileName(fileName, "application/octet-stream");
  const lower = fileName.toLowerCase();
  const extractedFields: Record<string, string | number> = {
    farmerName: farmer.name,
    county: farmer.county,
    cooperative: farmer.cooperative,
  };

  if (docType === "identity" || lower.includes("id")) {
    extractedFields.documentLabel = "National ID";
  }
  if (docType === "land_record" || lower.includes("land") || lower.includes("title")) {
    extractedFields.parcelHa = farmer.parcelHa ?? 0;
  }
  if (docType === "cooperative_membership" || lower.includes("coop")) {
    extractedFields.cooperativeName = farmer.cooperative;
  }

  return {
    documentType: docType,
    extractedFields,
    entities: [
      { type: "Cooperative", name: farmer.cooperative, confidence: 0.65 },
      { type: "Farmer", name: farmer.name, confidence: 0.9 },
    ],
    ocrConfidence: 0.55,
    verificationHint: "pending_review",
    provider: "rules",
  };
}

function buildMessages(
  farmer: FarmerProfile,
  fileName: string,
  mimeType: string,
  textContent: string | null,
  imageDataUrl: string | null,
): ChatMessage[] {
  const allowedTypes = DOCUMENT_TYPES.map((type) => `${type} (${TYPE_LABELS[type]})`).join(", ");

  const system = `You classify and extract structured facts from agricultural finance documents in Kenya.
First classify the document into exactly one documentType from: ${allowedTypes}.
Return JSON only with keys:
documentType, extractedFields (object), entities (array of {type, name, confidence}),
ocrConfidence (0-1), verificationHint ("verified"|"pending_review"|"conflict").
Use ONLY evidence from the document content or metadata. Do not invent national IDs or amounts.`;

  const context = {
    farmerName: farmer.name,
    farmerId: farmer.farmerId,
    county: farmer.county,
    cooperative: farmer.cooperative,
    cropType: farmer.cropType,
    fileName,
    mimeType,
    textContent: textContent?.slice(0, 8000) ?? null,
  };

  if (imageDataUrl) {
    return [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Classify this document and extract facts.\n${JSON.stringify(context)}`,
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ];
  }

  return [
    { role: "system", content: system },
    {
      role: "user",
      content: `Classify this document and extract facts.\n${JSON.stringify(context)}`,
    },
  ];
}

function normalizeExtraction(
  parsed: Record<string, unknown>,
  fallbackType: FarmerDocumentType,
  provider: IngestionLlmProvider,
): DocumentExtractionResult {
  const extractedFields =
    parsed.extractedFields && typeof parsed.extractedFields === "object"
      ? (parsed.extractedFields as Record<string, string | number>)
      : {};

  const entities = Array.isArray(parsed.entities)
    ? parsed.entities
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const row = item as Record<string, unknown>;
          return {
            type: String(row.type ?? "Entity"),
            name: String(row.name ?? "Unknown"),
            confidence: Number(row.confidence ?? 0.5),
          };
        })
    : [];

  const verificationHint =
    parsed.verificationHint === "verified" ||
    parsed.verificationHint === "pending_review" ||
    parsed.verificationHint === "conflict"
      ? parsed.verificationHint
      : "pending_review";

  return {
    documentType: normalizeDocType(parsed.documentType, fallbackType),
    extractedFields,
    entities,
    ocrConfidence: Math.min(1, Math.max(0, Number(parsed.ocrConfidence ?? 0.7))),
    verificationHint,
    provider,
  };
}

export async function extractDocumentFacts(input: {
  farmer: FarmerProfile;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<DocumentExtractionResult> {
  const inferredType = inferDocTypeFromFileName(input.fileName, input.mimeType);
  const textContent = extractTextFromBuffer(input.mimeType, input.buffer);
  const isImage = input.mimeType.toLowerCase().startsWith("image/");
  const imageDataUrl = isImage ? toDataUrl(input.mimeType, input.buffer) : null;

  const messages = buildMessages(
    input.farmer,
    input.fileName,
    input.mimeType,
    textContent,
    imageDataUrl,
  );

  const llm = await chatCompletionWithFallback(messages);
  if (llm) {
    const parsed = parseJsonBlock(llm.text);
    if (parsed) {
      return normalizeExtraction(parsed, inferredType, llm.provider);
    }
  }

  return rulesExtraction(input.fileName, input.farmer);
}

export function documentTypeLabel(type: FarmerDocumentType | string): string {
  if (type in TYPE_LABELS) return TYPE_LABELS[type as FarmerDocumentType];
  return String(type);
}
