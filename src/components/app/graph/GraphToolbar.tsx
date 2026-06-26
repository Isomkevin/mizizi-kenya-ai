import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GraphToolbarProps {
  farmerId?: string;
  query: string;
  onQueryChange: (value: string) => void;
  onReset: () => void;
}

export function GraphToolbar({ farmerId, query, onQueryChange, onReset }: GraphToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search graph nodes..."
          className="h-9 pl-10"
        />
      </div>
      {farmerId ? (
        <span className="rounded-md border border-border bg-background px-2 py-1 font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
          Farmer focus: {farmerId}
        </span>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={onReset}>
        Reset view
      </Button>
    </div>
  );
}
