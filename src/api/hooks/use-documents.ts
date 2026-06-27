import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { FarmerDocumentType, UploadFarmerDocumentInput } from "@/api/types";
import { uploadFarmerDocumentFn } from "@/api/functions/documents";

const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "text/plain",
  "text/csv",
  "application/csv",
];

const MAX_BYTES = 10 * 1024 * 1024;

export const FARMER_DOCUMENT_TYPES: Array<{ value: FarmerDocumentType; label: string }> = [
  { value: "identity", label: "National ID / identity" },
  { value: "land_record", label: "Land ownership" },
  { value: "farm_photo", label: "Farm photo" },
  { value: "loan_agreement", label: "Loan agreement" },
  { value: "insurance", label: "Insurance certificate" },
  { value: "satellite_report", label: "Satellite report" },
  { value: "cooperative_membership", label: "Cooperative membership" },
  { value: "quotation", label: "Input quotation" },
  { value: "other", label: "Other" },
];

export function isAcceptedDocumentFile(file: File): boolean {
  return ACCEPTED_MIME.includes(file.type) || /\.(pdf|jpe?g|png|webp|txt|csv)$/i.test(file.name);
}

export async function fileToBase64(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("File exceeds the 10MB upload limit.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file."));
        return;
      }
      const base64 = result.includes(",") ? result.split(",")[1]! : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export function useUploadFarmerDocument(farmerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<UploadFarmerDocumentInput, "farmerId">) => {
      return uploadFarmerDocumentFn({
        data: {
          farmerId,
          ...input,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmers", "detail", farmerId] });
      queryClient.invalidateQueries({ queryKey: ["farmers", "profiles"] });
    },
  });
}
