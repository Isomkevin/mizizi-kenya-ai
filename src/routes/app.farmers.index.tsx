import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { UserPlus } from "lucide-react";

import { useFarmers, type FarmerFiltersInput } from "@/api/hooks/use-farmers";
import { CreateFarmerDialog } from "@/components/app/farmers/CreateFarmerDialog";
import { FarmerFilters } from "@/components/app/farmers/FarmerFilters";
import { FarmerResultCard } from "@/components/app/farmers/FarmerResultCard";
import { FarmerSearchBar } from "@/components/app/farmers/FarmerSearchBar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/farmers/")({
  validateSearch: (search: Record<string, unknown>) => ({
    create: search.create === true || search.create === "true" || search.create === "1",
  }),
  head: () => ({
    meta: [{ title: "Mizizi · Borrowers" }],
  }),
  component: FarmerSearchPage,
});

function FarmerSearchPage() {
  const { create } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<FarmerFiltersInput>({
    county: "all",
    cooperative: "all",
    cropType: "all",
    risk: "all",
    status: "all",
  });

  useEffect(() => {
    if (create) {
      setCreateOpen(true);
      void navigate({ search: { create: undefined }, replace: true });
    }
  }, [create, navigate]);

  const mergedFilters = useMemo(() => ({ ...filters, query }), [filters, query]);
  const { data: farmers = [] } = useFarmers(mergedFilters);
  const { data: allFarmers = [] } = useFarmers({});

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Borrowers</p>
          <h1 className="font-display text-4xl leading-tight md:text-5xl">Borrower search</h1>
          <p className="max-w-3xl text-muted-foreground">
            Find borrowers by name, ID, or cooperative. Review financial history, climate exposure,
            and verified relationships before you decide.
          </p>
        </div>
        <Button className="shrink-0" onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Create farmer
        </Button>
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

      <CreateFarmerDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
