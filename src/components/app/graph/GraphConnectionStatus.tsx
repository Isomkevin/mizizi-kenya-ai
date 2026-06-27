import type { GraphPayload } from "@/api/types";
import { useNeo4jStatus } from "@/api/hooks/use-neo4j-status";

interface GraphConnectionStatusProps {
  graphMeta?: GraphPayload["meta"];
}

export function GraphConnectionStatus({ graphMeta }: GraphConnectionStatusProps) {
  const { data: status } = useNeo4jStatus();

  if (status?.connected) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          Neo4j {status.profile ?? "connected"}
        </span>
        <span className="rounded-md border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Graph {graphMeta?.source ?? "neo4j"}
        </span>
        {typeof status.farmerNodes === "number" ? (
          <span className="text-[10px] text-muted-foreground">
            {status.farmerNodes} farmers · {status.relationshipCount ?? 0} links
          </span>
        ) : null}
      </div>
    );
  }

  if (status && !status.connected) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-200">
          Neo4j offline
        </span>
        <span className="rounded-md border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Graph {graphMeta?.source ?? "local"}
        </span>
        <span className="text-[10px] text-muted-foreground">
          Local fallback — see docs/neo4j.md
        </span>
      </div>
    );
  }

  return (
    <span className="rounded-md border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
      Checking graph database…
    </span>
  );
}
