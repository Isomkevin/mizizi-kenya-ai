import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface FarmerSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function FarmerSearchBar({ value, onChange }: FarmerSearchBarProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 pl-10"
        placeholder="Search by name, farmer ID, cooperative, county..."
      />
    </div>
  );
}
