import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, FileWarning, Loader2, ShieldCheck } from "lucide-react";

import {
  documentTypeLabel,
  FARMER_DOCUMENT_TYPES,
  useConfirmFarmerDocument,
  useReclassifyFarmerDocument,
} from "@/api/hooks/use-documents";
import { useFarmerProfile } from "@/api/hooks/use-farmers";
import type { DocumentRecord, FarmerDocumentType, FarmerProfile } from "@/api/types";
import { DocumentDropZone } from "@/components/app/farmers/DocumentDropZone";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function FarmerDocumentsTab({ farmer }: { farmer: FarmerProfile }) {
  const hasProcessing = farmer.documents.some((doc) => doc.ingestionStatus === "processing");
  const { refetch } = useFarmerProfile(farmer.id);

  useEffect(() => {
    if (!hasProcessing) return;
    const timer = window.setInterval(() => {
      void refetch();
    }, 2500);
    return () => window.clearInterval(timer);
  }, [hasProcessing, refetch]);

  const pendingReview = farmer.documents.filter(
    (doc) => doc.classificationStatus === "pending_review" && doc.ingestionStatus === "complete",
  ).length;

  return (
    <div className="space-y-4">
      <DocumentDropZone farmerId={farmer.id} />

      {pendingReview > 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <span className="font-medium">{pendingReview} document{pendingReview === 1 ? "" : "s"}</span>{" "}
          classified and awaiting your confirmation before graph linking.
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl">Ingested documents</h3>
          <span className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
            {farmer.documents.length} file{farmer.documents.length === 1 ? "" : "s"}
          </span>
        </div>

        {farmer.documents.length ? (
          <ul className="mt-4 space-y-2">
            {farmer.documents.map((document) => (
              <DocumentRow key={document.id} farmerId={farmer.id} document={document} />
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No documents yet. Drop files above — Mizizi will classify them automatically.
          </div>
        )}
      </section>
    </div>
  );
}

function DocumentRow({ farmerId, document }: { farmerId: string; document: DocumentRecord }) {
  const confirm = useConfirmFarmerDocument(farmerId);
  const reclassify = useReclassifyFarmerDocument(farmerId);
  const [editType, setEditType] = useState<FarmerDocumentType>(
    (document.type as FarmerDocumentType) ?? "other",
  );

  useEffect(() => {
    setEditType((document.type as FarmerDocumentType) ?? "other");
  }, [document.type]);

  const status = document.ingestionStatus ?? "complete";
  const awaitingConfirm =
    status === "complete" && document.classificationStatus === "pending_review";
  const isConfirmed = document.classificationStatus === "confirmed";

  const StatusIcon =
    status === "processing"
      ? Loader2
      : status === "failed"
        ? FileWarning
        : awaitingConfirm
          ? ShieldCheck
          : CheckCircle2;

  return (
    <li className="rounded-md border border-border bg-background p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="font-medium">{document.name}</div>

          {status === "processing" ? (
            <p className="text-muted-foreground">Classifying document…</p>
          ) : (
            <p className="text-muted-foreground">
              Detected:{" "}
              <span className="font-medium text-foreground">
                {documentTypeLabel(document.type)}
              </span>
              {document.classificationConfidence != null
                ? ` · ${Math.round(document.classificationConfidence * 100)}% confidence`
                : null}
            </p>
          )}

          {document.extractedFields && Object.keys(document.extractedFields).length > 0 ? (
            <div className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
              {Object.entries(document.extractedFields)
                .slice(0, 4)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" · ")}
            </div>
          ) : null}

          {awaitingConfirm ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Select
                value={editType}
                onValueChange={(value) => setEditType(value as FarmerDocumentType)}
              >
                <SelectTrigger className="h-8 w-full max-w-xs">
                  <SelectValue placeholder="Reclassify" />
                </SelectTrigger>
                <SelectContent>
                  {FARMER_DOCUMENT_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={reclassify.isPending || editType === document.type}
                onClick={() =>
                  void reclassify.mutateAsync({ documentId: document.id, docType: editType })
                }
              >
                {reclassify.isPending ? "Saving…" : "Update type"}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={confirm.isPending}
                onClick={() => void confirm.mutateAsync(document.id)}
              >
                {confirm.isPending ? "Confirming…" : "Confirm classification"}
              </Button>
            </div>
          ) : null}

          {document.errorMessage ? (
            <p className="text-xs text-destructive">{document.errorMessage}</p>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border border-border px-2 py-1",
              status === "processing" && "text-primary",
              status === "failed" && "text-destructive",
              awaitingConfirm && "border-amber-500/40 text-amber-700 dark:text-amber-300",
              isConfirmed && "border-primary/30 text-primary",
            )}
          >
            <StatusIcon className={cn("h-3.5 w-3.5", status === "processing" && "animate-spin")} />
            {status === "processing"
              ? "classifying"
              : awaitingConfirm
                ? "awaiting confirm"
                : isConfirmed
                  ? "confirmed"
                  : status}
          </span>
          {document.extractionProvider ? (
            <span className="font-mono-data text-[10px] uppercase tracking-wider">
              via {document.extractionProvider}
            </span>
          ) : null}
          {document.graphSyncStatus ? (
            <span className="inline-flex items-center gap-1 font-mono-data text-[10px] uppercase tracking-wider">
              <Clock3 className="h-3 w-3" />
              graph {document.graphSyncStatus}
            </span>
          ) : null}
          <span>{new Date(document.uploadedAt).toLocaleString()}</span>
        </div>
      </div>
    </li>
  );
}
