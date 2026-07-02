import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/api/middleware/require-auth";

import type {
  ConfirmFarmerDocumentInput,
  ReclassifyFarmerDocumentInput,
  RemoveFarmerDocumentInput,
  UploadFarmerDocumentInput,
} from "@/api/types";
import {
  confirmDocumentClassification,
  processDocumentIngestion,
  reclassifyDocument,
  removeFarmerDocument,
  stageDocumentUpload,
} from "@/server/services/ingestion-service";

export const uploadFarmerDocumentFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: UploadFarmerDocumentInput) => data)
  .handler(async ({ data }) => {
    const upload = await stageDocumentUpload(data);
    void processDocumentIngestion(upload.farmerId, upload.documentId).catch((error) => {
      console.error("[ingestion] background processing failed:", error);
    });
    return upload;
  });

export const confirmFarmerDocumentFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: ConfirmFarmerDocumentInput) => data)
  .handler(async ({ data }) => {
    return confirmDocumentClassification(data.farmerId, data.documentId);
  });

export const reclassifyFarmerDocumentFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: ReclassifyFarmerDocumentInput) => data)
  .handler(async ({ data }) => {
    return reclassifyDocument(data);
  });

export const removeFarmerDocumentFn = createServerFn({ method: "POST" }).middleware([requireAuth])
  .validator((data: RemoveFarmerDocumentInput) => data)
  .handler(async ({ data }) => {
    return removeFarmerDocument(data.farmerId, data.documentId);
  });
