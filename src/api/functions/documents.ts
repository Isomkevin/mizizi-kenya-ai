import { createServerFn } from "@tanstack/react-start";

import type { UploadFarmerDocumentInput } from "@/api/types";
import {
  processDocumentIngestion,
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
