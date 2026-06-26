import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";

import { useDashboard } from "@/api/hooks/use-dashboard";
import type { RiskBand } from "@/api/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { riskColor } from "@/lib/risk";

const chartConfig = {
  farmers: { label: "Farmers", color: "var(--moss)" },
} as const;

function formatKes(n: number) {
  if (n >= 1000) return `KES ${(n / 1000).toFixed(0)}k`;
  return `KES ${n}`;
}

export function RiskDistributionChart() {
  const { data: dashboard } = useDashboard();
  const riskBands = dashboard?.riskBands ?? [];
  const [active, setActive] = useState<RiskBand | null>(null);
  const highlighted = active ?? riskBands[2] ?? riskBands[0];
  if (!highlighted) return null;

  const chartData = riskBands.map((b) => ({
    ...b,
    fill: riskColor(b.level),
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono-data text-[11px] uppercase tracking-widest text-muted-foreground">
            Risk distribution
          </div>
          <h2 className="font-display mt-1 text-2xl">Portfolio composition</h2>
        </div>
        <Link
          to="/app/analytics"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Open analytics <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <ChartContainer config={chartConfig} className="mt-6 h-[220px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
          onMouseLeave={() => setActive(null)}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={72}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip
            cursor={{ fill: "var(--accent)", opacity: 0.4 }}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, _name, item) => {
                  const band = item.payload as RiskBand;
                  return (
                    <div className="grid gap-1">
                      <div className="font-medium">{band.percent}% of portfolio</div>
                      <div className="text-muted-foreground">
                        {Number(value).toLocaleString()} farmers
                      </div>
                    </div>
                  );
                }}
              />
            }
          />
          <Bar
            dataKey="farmers"
            radius={[0, 4, 4, 0]}
            onMouseEnter={(_d, i) => setActive(riskBands[i])}
          >
            {chartData.map((entry) => (
              <Cell key={entry.level} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-4 grid gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Farmers" value={highlighted.farmers.toLocaleString()} />
        <Detail label="Avg. loan" value={formatKes(highlighted.avgLoanKes)} />
        <Detail label="Approval %" value={`${highlighted.approvalRate}%`} />
        <Detail label="Climate exposure" value={`${highlighted.climateExposure}%`} />
      </div>

      <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full">
        {riskBands.map((b) => (
          <div
            key={b.level}
            style={{ width: `${b.percent}%`, background: riskColor(b.level) }}
            className="h-full transition-opacity"
            title={`${b.label}: ${b.percent}%`}
          />
        ))}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-data text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
