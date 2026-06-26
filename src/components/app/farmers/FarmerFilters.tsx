import type { FarmerFiltersInput } from "@/api/hooks/use-farmers";
import type { FarmerSummary, RiskLevel } from "@/api/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FarmerFiltersProps {
  farmers: FarmerSummary[];
  filters: FarmerFiltersInput;
  onChange: (filters: FarmerFiltersInput) => void;
}

const riskValues: Array<RiskLevel | "all"> = [
  "all",
  "very-low",
  "low",
  "medium",
  "high",
  "critical",
];

export function FarmerFilters({ farmers, filters, onChange }: FarmerFiltersProps) {
  const counties = uniqueOf(farmers.map((f) => f.county));
  const cooperatives = uniqueOf(farmers.map((f) => f.cooperative));
  const crops = uniqueOf(farmers.map((f) => f.cropType));

  const update = <K extends keyof FarmerFiltersInput>(key: K, value: FarmerFiltersInput[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="font-mono-data text-[10px] uppercase tracking-widest text-muted-foreground">
        Filters
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <FilterSelect
          placeholder="County"
          value={filters.county ?? "all"}
          options={["all", ...counties]}
          onValueChange={(value) => update("county", value)}
        />
        <FilterSelect
          placeholder="Cooperative"
          value={filters.cooperative ?? "all"}
          options={["all", ...cooperatives]}
          onValueChange={(value) => update("cooperative", value)}
        />
        <FilterSelect
          placeholder="Crop type"
          value={filters.cropType ?? "all"}
          options={["all", ...crops]}
          onValueChange={(value) => update("cropType", value)}
        />
        <FilterSelect
          placeholder="Risk tier"
          value={filters.risk ?? "all"}
          options={riskValues}
          onValueChange={(value) => update("risk", value as RiskLevel | "all")}
        />
        <FilterSelect
          placeholder="Application status"
          value={filters.status ?? "all"}
          options={["all", "pending", "approved", "under_review"]}
          onValueChange={(value) => update("status", value)}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        className="h-8 px-0 text-xs text-muted-foreground hover:text-foreground"
        onClick={() =>
          onChange({
            query: filters.query,
            county: "all",
            cooperative: "all",
            cropType: "all",
            risk: "all",
            status: "all",
          })
        }
      >
        Reset filters
      </Button>
    </div>
  );
}

function FilterSelect({
  value,
  options,
  onValueChange,
  placeholder,
}: {
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option === "all" ? `All ${placeholder.toLowerCase()}` : option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function uniqueOf(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
