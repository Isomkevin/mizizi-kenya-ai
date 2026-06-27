import { useEffect } from "react";
import { CheckCircle2, Clock3, FileWarning, Loader2 } from "lucide-react";

import { useFarmerProfile } from "@/api/hooks/use-farmers";
import type { DocumentRecord, FarmerProfile } from "@/api/types";
import { DocumentDropZone } from "@/components/app/farmers/DocumentDropZone";
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

  return (
    <div className="space-y-4">
      <DocumentDropZone farmerId={farmer.id} />

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
              <DocumentRow key={document.id} document={document} />
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No documents yet. Upload identity, land, or cooperative records to begin verification
            and graph enrichment.
          </div>
        )}
      </section>
    </div>
  );
}

function DocumentRow({ document }: { document: DocumentRecord }) {
  const status = document.ingestionStatus ?? "complete";
  const StatusIcon =
    status === "processing" ? Loader2 : status === "failed" ? FileWarning : CheckCircle2;

  return (
    <li className="rounded-md border border-border bg-background p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="font-medium">{document.name}</div>
          <div className="text-muted-foreground">
            {document.type} · {document.verificationStatus} · OCR {document.ocrStatus}
          </div>
          {document.extractedFields && Object.keys(document.extractedFields).length > 0 ? (
            <div className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
              {Object.entries(document.extractedFields)
                .slice(0, 4)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" · ")}
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
            )}
          >
            <StatusIcon className={cn("h-3.5 w-3.5", status === "processing" && "animate-spin")} />
            {status}
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
