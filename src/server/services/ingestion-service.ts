import type {
  DocumentExtractionResult,
  DocumentRecord,
  DocumentUploadResult,
  FarmerDocumentType,
  FarmerProfile,
  ReclassifyFarmerDocumentInput,
  UploadFarmerDocumentInput,
} from "@/api/types";
import {
  documentTypeLabel,
  extractDocumentFacts,
  inferDocTypeFromFileName,
} from "@/server/services/document-extraction";
import {
  decodeUploadContent,
  deleteFarmerDocumentFile,
  saveFarmerDocumentFile,
  validateUploadMime,
} from "@/server/services/document-storage";
import { syncDocumentToGraph, syncFarmerToGraph } from "@/server/services/neo4j";
import { getPersistence } from "@/server/services/persistence";
import { assessFarmerRisk } from "@/server/services/risk-engine";
import { syncFarmerDataGaps } from "@/server/services/farmer-gaps";

function newDocumentId(farmerId: string): string {
  return `${farmerId}-doc-${Date.now()}`;
}

function verificationFromHint(hint: DocumentExtractionResult["verificationHint"]): string {
  switch (hint) {
    case "verified":
      return "verified";
    case "conflict":
      return "conflict";
    default:
      return "pending_review";
  }
}

function extractionFromDocument(document: DocumentRecord): DocumentExtractionResult {
  return {
    documentType: (document.type as FarmerDocumentType) ?? "other",
    extractedFields: document.extractedFields ?? {},
    entities: document.extractedEntities ?? [],
    ocrConfidence: document.ocrConfidence ?? 0.5,
    verificationHint:
      document.verificationStatus === "verified"
        ? "verified"
        : document.verificationStatus === "conflict"
          ? "conflict"
          : "pending_review",
    provider: document.extractionProvider ?? "rules",
  };
}

async function applyExtractionToFarmer(
  farmer: FarmerProfile,
  extraction: DocumentExtractionResult,
): Promise<FarmerProfile> {
  const cooperativeName =
    extraction.extractedFields.cooperativeName ?? extraction.extractedFields.cooperative;
  const parcelHa = extraction.extractedFields.parcelHa;

  const updated: FarmerProfile = {
    ...farmer,
    cooperative:
      typeof cooperativeName === "string" && cooperativeName.trim()
        ? cooperativeName
        : farmer.cooperative,
    parcelHa: typeof parcelHa === "number" && parcelHa > 0 ? parcelHa : farmer.parcelHa,
    dataCompleteness: Math.min(100, farmer.dataCompleteness + 8),
    sourceFreshness: "Just now",
    graphConnections:
      farmer.graphConnections + extraction.entities.filter((e) => e.confidence >= 0.6).length,
    trustIndicators: Array.from(
      new Set([
        ...farmer.trustIndicators,
        `${documentTypeLabel(extraction.documentType)} document confirmed`,
      ]),
    ),
  };

  const assessment = await assessFarmerRisk(updated);
  return {
    ...updated,
    risk: assessment.risk,
    confidence: assessment.confidence,
    recommendation: assessment.recommendation,
    contributingFactors: assessment.factors.length
      ? assessment.factors
      : updated.contributingFactors,
  };
}

function findDocumentIndex(farmer: FarmerProfile, documentId: string): number {
  return farmer.documents.findIndex((doc) => doc.id === documentId);
}

export async function stageDocumentUpload(
  input: UploadFarmerDocumentInput,
): Promise<DocumentUploadResult> {
  if (!validateUploadMime(input.mimeType)) {
    throw new Error("Unsupported file type. Use PDF, image, CSV, or plain text.");
  }

  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(input.farmerId);
  if (!farmer) {
    throw new Error("Farmer profile not found.");
  }

  const buffer = decodeUploadContent(input.contentBase64);
  const documentId = newDocumentId(farmer.id);
  const storagePath = await saveFarmerDocumentFile(farmer.id, documentId, input.fileName, buffer);

  const now = new Date().toISOString();
  const document: DocumentRecord = {
    id: documentId,
    name: input.fileName,
    type: "other",
    verificationStatus: "pending_review",
    uploadedAt: now,
    source: "officer_upload",
    ocrStatus: "processing",
    mimeType: input.mimeType,
    sizeBytes: buffer.length,
    storagePath,
    ingestionStatus: "processing",
    graphSyncStatus: "pending",
  };

  farmer.documents = [document, ...farmer.documents];
  farmer.timeline = [
    {
      id: `${documentId}-tl`,
      timestamp: now,
      category: "document",
      title: "Document uploaded",
      description: `${input.fileName} queued for automatic classification.`,
    },
    ...farmer.timeline,
  ];

  await persistence.upsertFarmer(farmer);

  return {
    documentId,
    farmerId: farmer.id,
    ingestionStatus: "processing",
  };
}

export async function processDocumentIngestion(
  farmerId: string,
  documentId: string,
): Promise<void> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) return;

  const index = findDocumentIndex(farmer, documentId);
  if (index === -1) return;

  const current = farmer.documents[index];
  if (current.ingestionStatus === "complete" && current.classificationStatus === "confirmed") {
    return;
  }

  try {
    if (!current.storagePath) {
      throw new Error("Stored file path missing.");
    }

    const { readFile } = await import("node:fs/promises");
    const buffer = await readFile(current.storagePath);
    const extraction = await extractDocumentFacts({
      farmer,
      fileName: current.name,
      mimeType: current.mimeType ?? "application/octet-stream",
      buffer,
    });

    const classified: DocumentRecord = {
      ...current,
      type: extraction.documentType,
      detectedType: extraction.documentType,
      classificationConfidence: extraction.ocrConfidence,
      verificationStatus: "pending_review",
      ocrStatus: "complete",
      ocrConfidence: extraction.ocrConfidence,
      extractionProvider: extraction.provider,
      extractedFields: extraction.extractedFields,
      extractedEntities: extraction.entities,
      ingestionStatus: "complete",
      classificationStatus: "pending_review",
      graphSyncStatus: "pending",
    };

    farmer.documents[index] = classified;
    farmer.timeline = [
      {
        id: `${documentId}-classified`,
        timestamp: new Date().toISOString(),
        category: "document",
        title: "Document classified",
        description: `${current.name} detected as ${documentTypeLabel(extraction.documentType)} (${Math.round(extraction.ocrConfidence * 100)}% confidence). Awaiting officer confirmation.`,
      },
      ...farmer.timeline,
    ];

    await persistence.upsertFarmer(farmer);
  } catch (error) {
    const failed: DocumentRecord = {
      ...current,
      ingestionStatus: "failed",
      ocrStatus: "failed",
      graphSyncStatus: "failed",
      errorMessage: error instanceof Error ? error.message : "Ingestion failed.",
    };
    farmer.documents[index] = failed;
    farmer.timeline = [
      {
        id: `${documentId}-failed`,
        timestamp: new Date().toISOString(),
        category: "document",
        title: "Document ingestion failed",
        description: failed.errorMessage ?? "Unknown error",
      },
      ...farmer.timeline,
    ];
    await persistence.upsertFarmer(farmer);
  }
}

export async function confirmDocumentClassification(
  farmerId: string,
  documentId: string,
): Promise<FarmerProfile> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) {
    throw new Error("Farmer profile not found.");
  }

  const index = findDocumentIndex(farmer, documentId);
  if (index === -1) {
    throw new Error("Document not found.");
  }

  const current = farmer.documents[index];
  if (current.classificationStatus === "confirmed") {
    return farmer;
  }
  if (current.ingestionStatus !== "complete") {
    throw new Error("Document classification is not ready for confirmation.");
  }

  const extraction = extractionFromDocument(current);
  const updatedFarmer = await applyExtractionToFarmer(farmer, extraction);

  const confirmed: DocumentRecord = {
    ...current,
    verificationStatus: verificationFromHint(extraction.verificationHint),
    classificationStatus: "confirmed",
    graphSyncStatus: "pending",
  };

  updatedFarmer.documents[index] = confirmed;
  updatedFarmer.timeline = [
    {
      id: `${documentId}-confirmed`,
      timestamp: new Date().toISOString(),
      category: "document",
      title: "Document confirmed",
      description: `Officer confirmed ${current.name} as ${documentTypeLabel(confirmed.type)}.`,
    },
    ...updatedFarmer.timeline,
  ];

  await persistence.upsertFarmer(updatedFarmer);

  const graphResult = await syncDocumentToGraph(updatedFarmer, confirmed, extraction);
  confirmed.graphSyncStatus = graphResult.synced ? "synced" : "failed";
  updatedFarmer.documents[index] = confirmed;
  await persistence.upsertFarmer(updatedFarmer);
  await syncFarmerToGraph(updatedFarmer);

  let latest = await persistence.getFarmerById(farmerId);
  if (!latest) {
    throw new Error("Farmer profile not found after confirmation.");
  }

  latest = await syncFarmerDataGaps(latest);
  latest.timeline = [
    {
      id: `${documentId}-gaps`,
      timestamp: new Date().toISOString(),
      category: "graph",
      title: "Graph gap scan complete",
      description:
        latest.dataGaps?.filter((gap) => gap.status === "missing").length === 0
          ? "All key signals are linked after ingestion."
          : `${latest.dataGaps?.filter((gap) => gap.status === "missing").length ?? 0} signal(s) still missing — review data gaps.`,
    },
    ...latest.timeline,
  ];
  await persistence.upsertFarmer(latest);
  return latest;
}

export async function reclassifyDocument(
  input: ReclassifyFarmerDocumentInput,
): Promise<FarmerProfile> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(input.farmerId);
  if (!farmer) {
    throw new Error("Farmer profile not found.");
  }

  const index = findDocumentIndex(farmer, input.documentId);
  if (index === -1) {
    throw new Error("Document not found.");
  }

  const current = farmer.documents[index];
  if (current.classificationStatus === "confirmed") {
    throw new Error("Confirmed documents cannot be reclassified.");
  }
  if (current.ingestionStatus !== "complete") {
    throw new Error("Document is not ready for reclassification.");
  }

  const inferred = inferDocTypeFromFileName(current.name, current.mimeType ?? "");
  const updated: DocumentRecord = {
    ...current,
    type: input.docType,
    detectedType: current.detectedType ?? inferred,
    classificationStatus: "pending_review",
  };

  farmer.documents[index] = updated;
  farmer.timeline = [
    {
      id: `${input.documentId}-reclassified`,
      timestamp: new Date().toISOString(),
      category: "document",
      title: "Document reclassified",
      description: `Officer updated classification to ${documentTypeLabel(input.docType)}.`,
    },
    ...farmer.timeline,
  ];

  await persistence.upsertFarmer(farmer);
  const latest = await persistence.getFarmerById(input.farmerId);
  if (!latest) {
    throw new Error("Farmer profile not found after reclassification.");
  }
  return latest;
}

export async function removeFarmerDocument(
  farmerId: string,
  documentId: string,
): Promise<FarmerProfile> {
  const persistence = getPersistence();
  const farmer = await persistence.getFarmerById(farmerId);
  if (!farmer) {
    throw new Error("Farmer profile not found.");
  }

  const index = findDocumentIndex(farmer, documentId);
  if (index === -1) {
    throw new Error("Document not found.");
  }

  const current = farmer.documents[index];
  if (current.classificationStatus === "confirmed") {
    throw new Error("Confirmed documents cannot be removed from the profile.");
  }

  if (current.storagePath) {
    await deleteFarmerDocumentFile(current.storagePath);
  }

  farmer.documents = farmer.documents.filter((doc) => doc.id !== documentId);
  farmer.timeline = [
    {
      id: `${documentId}-removed`,
      timestamp: new Date().toISOString(),
      category: "document",
      title: "Document removed",
      description: `${current.name} was removed and will not be classified or linked to the graph.`,
    },
    ...farmer.timeline,
  ];

  await persistence.upsertFarmer(farmer);
  const latest = await persistence.getFarmerById(farmerId);
  if (!latest) {
    throw new Error("Farmer profile not found after removal.");
  }
  return latest;
}

export async function uploadAndIngestDocument(
  input: UploadFarmerDocumentInput,
): Promise<{ upload: DocumentUploadResult; farmer: FarmerProfile }> {
  const upload = await stageDocumentUpload(input);
  await processDocumentIngestion(upload.farmerId, upload.documentId);
  const farmer = await getPersistence().getFarmerById(upload.farmerId);
  if (!farmer) {
    throw new Error("Farmer profile not found after ingestion.");
  }
  return { upload, farmer };
}
