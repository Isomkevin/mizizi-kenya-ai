import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useFarmers, type FarmerFiltersInput } from "@/api/hooks/use-farmers";
import { FarmerFilters } from "@/components/app/farmers/FarmerFilters";
import { FarmerResultCard } from "@/components/app/farmers/FarmerResultCard";
import { FarmerSearchBar } from "@/components/app/farmers/FarmerSearchBar";

export const Route = createFileRoute("/app/farmers")({
  head: () => ({
    meta: [{ title: "Mizizi · Farmer Intelligence" }],
  }),
  component: FarmerSearchPage,
});

function FarmerSearchPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FarmerFiltersInput>({
    county: "all",
    cooperative: "all",
    cropType: "all",
    risk: "all",
    status: "all",
  });

  const mergedFilters = useMemo(() => ({ ...filters, query }), [filters, query]);
  const { data: farmers = [] } = useFarmers(mergedFilters);
  const { data: allFarmers = [] } = useFarmers({});

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <section className="space-y-2">
        <p className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
          Farmer intelligence
        </p>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">Farmer Search</h1>
        <p className="max-w-3xl text-muted-foreground">
          Search, resolve identity and inspect financial, climate and relationship signals for every
          farmer profile.
        </p>
      </section>

      <FarmerSearchBar value={query} onChange={setQuery} />
      <FarmerFilters farmers={allFarmers} filters={mergedFilters} onChange={setFilters} />

      <section className="space-y-3">
        <div className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
          {farmers.length} result{farmers.length === 1 ? "" : "s"}
        </div>
        {farmers.length ? (
          <div className="grid gap-3">
            {farmers.map((farmer) => (
              <FarmerResultCard key={farmer.id} farmer={farmer} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No farmers match your current filters.
          </div>
        )}
      </section>
    </div>
  );
}
