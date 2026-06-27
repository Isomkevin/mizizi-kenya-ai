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

function rulesExtraction(
  docType: FarmerDocumentType,
  fileName: string,
  farmer: FarmerProfile,
): DocumentExtractionResult {
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
  docType: FarmerDocumentType,
  fileName: string,
  mimeType: string,
  textContent: string | null,
  imageDataUrl: string | null,
): ChatMessage[] {
  const system = `You extract structured facts from agricultural finance documents in Kenya.
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
    selectedDocType: docType,
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
            text: `Extract document facts from this upload.\n${JSON.stringify(context)}`,
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
      content: `Extract document facts.\n${JSON.stringify(context)}`,
    },
  ];
}

function normalizeExtraction(
  parsed: Record<string, unknown>,
  docType: FarmerDocumentType,
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
    documentType: normalizeDocType(parsed.documentType, docType),
    extractedFields,
    entities,
    ocrConfidence: Math.min(1, Math.max(0, Number(parsed.ocrConfidence ?? 0.7))),
    verificationHint,
    provider,
  };
}

export async function extractDocumentFacts(input: {
  farmer: FarmerProfile;
  docType: FarmerDocumentType;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<DocumentExtractionResult> {
  const textContent = extractTextFromBuffer(input.mimeType, input.buffer);
  const isImage = input.mimeType.toLowerCase().startsWith("image/");
  const imageDataUrl = isImage ? toDataUrl(input.mimeType, input.buffer) : null;

  const messages = buildMessages(
    input.farmer,
    input.docType,
    input.fileName,
    input.mimeType,
    textContent,
    imageDataUrl,
  );

  const llm = await chatCompletionWithFallback(messages);
  if (llm) {
    const parsed = parseJsonBlock(llm.text);
    if (parsed) {
      return normalizeExtraction(parsed, input.docType, llm.provider);
    }
  }

  return rulesExtraction(input.docType, input.fileName, input.farmer);
}
