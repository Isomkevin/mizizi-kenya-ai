import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/api/types";
import { riskColor, riskLabels } from "@/lib/risk";

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 font-mono-data text-[10px] uppercase tracking-wider",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: riskColor(level) }} />
      {riskLabels[level]}
    </span>
  );
}
