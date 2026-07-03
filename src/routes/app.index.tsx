import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AgentsActivityTimeline } from "@/components/app/dashboard/AgentsActivityTimeline";
import { AiInsightsPanel } from "@/components/app/dashboard/AiInsightsPanel";
import { DashboardWelcome } from "@/components/app/dashboard/DashboardWelcome";
import { KenyaMap } from "@/components/app/dashboard/KenyaMap";
import { KpiGrid } from "@/components/app/dashboard/KpiGrid";
import { QuickActions } from "@/components/app/dashboard/QuickActions";
import { RecentActivityFeed } from "@/components/app/dashboard/RecentActivityFeed";
import { RiskDistributionChart } from "@/components/app/dashboard/RiskDistributionChart";
import { StellarZkCallout } from "@/components/app/dashboard/StellarZkCallout";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeletons";


export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading; replace with real data fetch logic later
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardWelcome />
          <KpiGrid />

          <StellarZkCallout />

          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

            <RiskDistributionChart />
            <AiInsightsPanel />
          </section>

          <KenyaMap />
          <QuickActions />
          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <RecentActivityFeed />
            <AgentsActivityTimeline />
          </section>
        </>
      )}
    </div>
  );
}
