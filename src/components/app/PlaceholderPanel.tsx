import { Construction } from "lucide-react";

export function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <Construction className="mx-auto h-6 w-6 text-muted-foreground" />
        <h1 className="font-display mt-6 text-3xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        <div className="font-mono-data mt-6 text-[11px] uppercase tracking-widest text-muted-foreground">
          Shipping in the next build phase
        </div>
      </div>
    </div>
  );
}
