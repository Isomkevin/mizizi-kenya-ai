import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useFarmerProfile } from "@/api/hooks/use-farmers";
import { FarmerActivityTab } from "@/components/app/farmers/FarmerActivityTab";
import { FarmerApplicationsTab } from "@/components/app/farmers/FarmerApplicationsTab";
import { FarmerClimateTab } from "@/components/app/farmers/FarmerClimateTab";
import { FarmerDecisionsTab } from "@/components/app/farmers/FarmerDecisionsTab";
import { FarmerDocumentsTab } from "@/components/app/farmers/FarmerDocumentsTab";
import { FarmerFinancialTab } from "@/components/app/farmers/FarmerFinancialTab";
import { FarmerOverviewTab } from "@/components/app/farmers/FarmerOverviewTab";
import { FarmerProfileHeader } from "@/components/app/farmers/FarmerProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/farmers/$farmerId")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [{ title: "Mizizi · Farmer Profile" }],
  }),
  component: FarmerProfilePage,
});

const PROFILE_TABS = [
  "overview",
  "financial",
  "climate",
  "applications",
  "decisions",
  "documents",
  "activity",
] as const;

function FarmerProfilePage() {
  const { farmerId } = Route.useParams();
  const { tab } = Route.useSearch();
  const initialTab = PROFILE_TABS.includes(tab as (typeof PROFILE_TABS)[number])
    ? (tab as (typeof PROFILE_TABS)[number])
    : "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { data: farmer, isLoading } = useFarmerProfile(farmerId);

  useEffect(() => {
    if (tab && PROFILE_TABS.includes(tab as (typeof PROFILE_TABS)[number])) {
      setActiveTab(tab as (typeof PROFILE_TABS)[number]);
    }
  }, [tab]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        Loading farmer profile…
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        Farmer profile not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <FarmerProfileHeader farmer={farmer} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="climate">Climate</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FarmerOverviewTab farmer={farmer} />
        </TabsContent>
        <TabsContent value="financial">
          <FarmerFinancialTab farmer={farmer} />
        </TabsContent>
        <TabsContent value="climate">
          <FarmerClimateTab farmer={farmer} />
        </TabsContent>
        <TabsContent value="applications">
          <FarmerApplicationsTab farmer={farmer} />
        </TabsContent>
        <TabsContent value="decisions">
          <FarmerDecisionsTab farmer={farmer} />
        </TabsContent>
        <TabsContent value="documents">
          <FarmerDocumentsTab farmer={farmer} />
        </TabsContent>
        <TabsContent value="activity">
          <FarmerActivityTab farmer={farmer} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
