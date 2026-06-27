import { createServerFn } from "@tanstack/react-start";

import type {
  ConfirmFarmerDocumentInput,
  ReclassifyFarmerDocumentInput,
  UploadFarmerDocumentInput,
} from "@/api/types";
import {
  confirmDocumentClassification,
  processDocumentIngestion,
  reclassifyDocument,
  stageDocumentUpload,
} from "@/server/services/ingestion-service";

export const uploadFarmerDocumentFn = createServerFn({ method: "POST" })
  .validator((data: UploadFarmerDocumentInput) => data)
  .handler(async ({ data }) => {
    const upload = await stageDocumentUpload(data);
    void processDocumentIngestion(upload.farmerId, upload.documentId).catch((error) => {
      console.error("[ingestion] background processing failed:", error);
    });
    return upload;
  });

export const confirmFarmerDocumentFn = createServerFn({ method: "POST" })
  .validator((data: ConfirmFarmerDocumentInput) => data)
  .handler(async ({ data }) => {
    return confirmDocumentClassification(data.farmerId, data.documentId);
  });

export const reclassifyFarmerDocumentFn = createServerFn({ method: "POST" })
  .validator((data: ReclassifyFarmerDocumentInput) => data)
  .handler(async ({ data }) => {
    return reclassifyDocument(data);
  });
