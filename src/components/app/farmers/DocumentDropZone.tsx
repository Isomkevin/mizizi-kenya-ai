import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

import {
  FARMER_DOCUMENT_TYPES,
  fileToBase64,
  isAcceptedDocumentFile,
  useUploadFarmerDocument,
} from "@/api/hooks/use-documents";
import type { FarmerDocumentType } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DocumentDropZoneProps {
  farmerId: string;
  className?: string;
}

export function DocumentDropZone({ farmerId, className }: DocumentDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadFarmerDocument(farmerId);
  const [docType, setDocType] = useState<FarmerDocumentType>("identity");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const list = Array.from(files);
      if (!list.length) return;

      for (const file of list) {
        if (!isAcceptedDocumentFile(file)) {
          setError(`${file.name}: unsupported type. Use PDF, image, CSV, or text.`);
          continue;
        }
        try {
          const contentBase64 = await fileToBase64(file);
          await upload.mutateAsync({
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            docType,
            contentBase64,
          });
        } catch (uploadError) {
          setError(
            uploadError instanceof Error ? uploadError.message : `Failed to upload ${file.name}.`,
          );
        }
      }
    },
    [docType, upload],
  );

  return (
    <section className={cn("space-y-4 rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">Document ingestion</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop identity, land, cooperative, and loan files. Extraction runs via Featherless with
            OpenRouter fallback, then syncs graph links in the background.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <Label htmlFor="doc-type" className="text-xs text-muted-foreground">
            Default document type
          </Label>
          <Select value={docType} onValueChange={(value) => setDocType(value as FarmerDocumentType)}>
            <SelectTrigger id="doc-type" className="mt-1 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FARMER_DOCUMENT_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          void handleFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-6 py-8 text-center transition",
          dragActive && "border-primary/50 bg-primary/5",
          upload.isPending && "pointer-events-none opacity-70",
        )}
      >
        {upload.isPending ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <FileUp className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="mt-3 text-sm font-medium">
          {upload.isPending ? "Uploading…" : "Drag and drop documents here"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG, WEBP, CSV, TXT · max 10MB</p>
        <Button type="button" variant="outline" size="sm" className="mt-4" tabIndex={-1}>
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,application/pdf,image/*,text/plain,text/csv"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
