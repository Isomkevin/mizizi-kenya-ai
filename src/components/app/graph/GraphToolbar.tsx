import { Search } from "lucide-react";

import type { GraphPayload } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GraphToolbarProps {
  farmerId?: string;
  query: string;
  depth: number;
  graphMeta?: GraphPayload["meta"];
  onQueryChange: (value: string) => void;
  onDepthChange: (depth: number) => void;
  onReset: () => void;
}

export function GraphToolbar({
  farmerId,
  query,
  depth,
  graphMeta,
  onQueryChange,
  onDepthChange,
  onReset,
}: GraphToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search cooperatives, borrowers, loans..."
          className="h-9 pl-10"
        />
      </div>
      <Select value={String(depth)} onValueChange={(value) => onDepthChange(Number(value))}>
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="Depth" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Depth 1</SelectItem>
          <SelectItem value="2">Depth 2</SelectItem>
          <SelectItem value="3">Depth 3</SelectItem>
        </SelectContent>
      </Select>
      {farmerId ? (
        <span className="rounded-md border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Focused borrower
        </span>
      ) : null}
      {graphMeta ? (
        <span className="rounded-md border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Source {graphMeta.source}
        </span>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={onReset}>
        Reset view
      </Button>
    </div>
  );
}
