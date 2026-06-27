import type {
  DocumentExtractionResult,
  DocumentRecord,
  DocumentUploadResult,
  FarmerDocumentType,
  FarmerProfile,
  UploadFarmerDocumentInput,
} from "@/api/types";
import { extractDocumentFacts } from "@/server/services/document-extraction";
import {
  decodeUploadContent,
  saveFarmerDocumentFile,
  validateUploadMime,
} from "@/server/services/document-storage";
import { syncDocumentToGraph, syncFarmerToGraph } from "@/server/services/neo4j";
import { getPersistence } from "@/server/services/persistence";
import { assessFarmerRisk } from "@/server/services/risk-engine";

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

function applyExtractionToFarmer(
  farmer: FarmerProfile,
  extraction: DocumentExtractionResult,
): FarmerProfile {
  const cooperativeName = extraction.extractedFields.cooperativeName ?? extraction.extractedFields.cooperative;
  const parcelHa = extraction.extractedFields.parcelHa;

  const updated: FarmerProfile = {
    ...farmer,
    cooperative:
      typeof cooperativeName === "string" && cooperativeName.trim()
        ? cooperativeName
        : farmer.cooperative,
    parcelHa:
      typeof parcelHa === "number" && parcelHa > 0 ? parcelHa : farmer.parcelHa,
    dataCompleteness: Math.min(100, farmer.dataCompleteness + 8),
    sourceFreshness: "Just now",
    graphConnections: farmer.graphConnections + extraction.entities.filter((e) => e.confidence >= 0.6).length,
    trustIndicators: Array.from(
      new Set([...farmer.trustIndicators, `${extraction.documentType} document ingested`]),
    ),
  };

  const assessment = assessFarmerRisk(updated);
  return {
    ...updated,
    risk: assessment.risk,
    confidence: assessment.confidence,
    contributingFactors: assessment.factors.length ? assessment.factors : updated.contributingFactors,
  };
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
  const storagePath = await saveFarmerDocumentFile(
    farmer.id,
    documentId,
    input.fileName,
    buffer,
  );

  const now = new Date().toISOString();
  const document: DocumentRecord = {
    id: documentId,
    name: input.fileName,
    type: input.docType,
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
      description: `${input.fileName} queued for ingestion.`,
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

  const index = farmer.documents.findIndex((doc) => doc.id === documentId);
  if (index === -1) return;

  const current = farmer.documents[index];
  if (current.ingestionStatus === "complete") return;

  try {
    if (!current.storagePath) {
      throw new Error("Stored file path missing.");
    }

    const { readFile } = await import("node:fs/promises");
    const buffer = await readFile(current.storagePath);
    const extraction = await extractDocumentFacts({
      farmer,
      docType: (current.type as FarmerDocumentType) ?? "other",
      fileName: current.name,
      mimeType: current.mimeType ?? "application/octet-stream",
      buffer,
    });

    const completed: DocumentRecord = {
      ...current,
      type: extraction.documentType,
      verificationStatus: verificationFromHint(extraction.verificationHint),
      ocrStatus: "complete",
      ocrConfidence: extraction.ocrConfidence,
      extractionProvider: extraction.provider,
      extractedFields: extraction.extractedFields,
      ingestionStatus: "complete",
      graphSyncStatus: "pending",
    };

    let updatedFarmer = applyExtractionToFarmer(farmer, extraction);
    updatedFarmer.documents[index] = completed;
    updatedFarmer.timeline = [
      {
        id: `${documentId}-ingested`,
        timestamp: new Date().toISOString(),
        category: "document",
        title: "Document ingested",
        description: `${current.name} processed via ${extraction.provider}.`,
      },
      ...updatedFarmer.timeline,
    ];

    await persistence.upsertFarmer(updatedFarmer);

    const graphResult = await syncDocumentToGraph(updatedFarmer, completed, extraction);
    completed.graphSyncStatus = graphResult.synced ? "synced" : "failed";
    updatedFarmer.documents[index] = completed;
    await persistence.upsertFarmer(updatedFarmer);
    await syncFarmerToGraph(updatedFarmer);
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
