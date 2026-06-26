import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { useAnalytics } from "@/api/hooks/use-analytics";
import { AnalyticsMap } from "@/components/app/analytics/AnalyticsMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/analytics")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : "executive",
  }),
  head: () => ({
    meta: [{ title: "Mizizi · Analytics" }],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useAnalytics();
  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <section className="space-y-2">
        <p className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
          Phase 6 · Analytics platform
        </p>
        <h1 className="font-display text-4xl leading-tight md:text-5xl">Platform Analytics</h1>
      </section>

      <Tabs
        value={tab}
        onValueChange={(next) => void navigate({ search: { tab: next } })}
        className="space-y-4"
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="executive">Executive</TabsTrigger>
          <TabsTrigger value="lending">Lending</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="climate">Climate</TabsTrigger>
          <TabsTrigger value="graph">Graph</TabsTrigger>
          <TabsTrigger value="explainability">Explainability</TabsTrigger>
        </TabsList>

        <TabsContent value="executive">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total farmers"
              value={data.executive.totalFarmers.toLocaleString()}
            />
            <MetricCard label="Applications" value={data.executive.applications.toLocaleString()} />
            <MetricCard label="Approval rate" value={`${data.executive.approvalRate}%`} />
            <MetricCard label="Graph coverage" value={`${data.executive.graphCoverage}%`} />
          </div>
        </TabsContent>

        <TabsContent value="lending">
          <Panel title="Lending trends">
            <LineChart width={920} height={320} data={data.lending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="var(--primary)"
                strokeWidth={2}
              />
              <Line type="monotone" dataKey="approved" stroke="var(--moss)" strokeWidth={2} />
              <Line type="monotone" dataKey="declined" stroke="var(--risk-high)" strokeWidth={2} />
            </LineChart>
          </Panel>
        </TabsContent>

        <TabsContent value="geographic">
          <AnalyticsMap />
        </TabsContent>

        <TabsContent value="climate">
          <Panel title="Climate indicators by county">
            <BarChart width={920} height={320} data={data.climate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="county" />
              <YAxis />
              <Bar dataKey="rainfall" fill="var(--azure)" />
              <Bar dataKey="drought" fill="var(--risk-high)" />
            </BarChart>
          </Panel>
        </TabsContent>

        <TabsContent value="graph">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard label="Nodes" value={data.graph.nodes.toLocaleString()} />
            <MetricCard label="Relationships" value={data.graph.relationships.toLocaleString()} />
            <MetricCard label="Communities" value={String(data.graph.communities)} />
            <MetricCard label="Avg degree" value={data.graph.avgDegree.toFixed(1)} />
            <MetricCard
              label="Resolution accuracy"
              value={`${data.graph.entityResolutionAccuracy}%`}
            />
          </div>
        </TabsContent>

        <TabsContent value="explainability">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Top factors">
              <ul className="space-y-2 text-sm">
                {data.explainability.topFactors.map((factor) => (
                  <li
                    key={factor.factor}
                    className="rounded-md border border-border bg-background p-3"
                  >
                    {factor.factor} · {factor.count}
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Override reasons">
              <ul className="space-y-2 text-sm">
                {data.explainability.overrideReasons.map((item) => (
                  <li
                    key={item.reason}
                    className="rounded-md border border-border bg-background p-3"
                  >
                    {item.reason} · {item.count}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-2xl">{title}</h3>
      <div className="mt-3 overflow-x-auto">{children}</div>
    </section>
  );
}
