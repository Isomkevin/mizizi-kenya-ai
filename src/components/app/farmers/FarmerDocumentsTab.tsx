import type { FarmerProfile } from "@/api/types";

export function FarmerDocumentsTab({ farmer }: { farmer: FarmerProfile }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-xl">Documents</h3>
      <ul className="mt-3 space-y-2">
        {farmer.documents.map((document) => (
          <li
            key={document.id}
            className="rounded-md border border-border bg-background p-3 text-sm"
          >
            <div className="font-medium">
              {document.name} · {document.type}
            </div>
            <div className="text-muted-foreground">
              {document.verificationStatus} · OCR {document.ocrStatus} · {document.uploadedAt}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
