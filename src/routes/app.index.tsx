import { createFileRoute } from "@tanstack/react-router";

import { AiInsightsPanel } from "@/components/app/dashboard/AiInsightsPanel";
import { DashboardWelcome } from "@/components/app/dashboard/DashboardWelcome";
import { KenyaMap } from "@/components/app/dashboard/KenyaMap";
import { KpiGrid } from "@/components/app/dashboard/KpiGrid";
import { QuickActions } from "@/components/app/dashboard/QuickActions";
import { RecentActivityFeed } from "@/components/app/dashboard/RecentActivityFeed";
import { RiskDistributionChart } from "@/components/app/dashboard/RiskDistributionChart";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
      <DashboardWelcome />
      <KpiGrid />

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <RiskDistributionChart />
        <AiInsightsPanel />
      </section>

      <KenyaMap />
      <QuickActions />
      <RecentActivityFeed />
    </div>
  );
}
