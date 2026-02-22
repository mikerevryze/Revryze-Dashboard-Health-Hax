import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { DailyMetrics } from "@shared/schema";

interface TrendsChartProps {
  data: DailyMetrics[];
}

type MetricKey = "spend" | "leads" | "cpl";

const METRIC_CONFIG: Record<MetricKey, { label: string; prefix: string; suffix: string }> = {
  spend: { label: "Spend", prefix: "$", suffix: "" },
  leads: { label: "Leads", prefix: "", suffix: "" },
  cpl: { label: "CPL", prefix: "$", suffix: "" },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value || 0;
  const key = payload[0]?.dataKey as MetricKey;
  const cfg = METRIC_CONFIG[key] || METRIC_CONFIG.spend;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0F1223]/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-[#10E29C]">{cfg.prefix}{val.toFixed(2)}{cfg.suffix}</p>
    </div>
  );
}

export function TrendsChart({ data }: TrendsChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("spend");

  const formatted = data.map((d) => ({
    ...d,
    displayDate: d.date ? new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
  }));

  const cfg = METRIC_CONFIG[activeMetric];

  return (
    <div className="glass-card rounded-xl p-6" data-testid="chart-trends">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground" data-testid="text-chart-title-trends">Trends</h3>
          <p className="text-xs text-muted-foreground">Daily performance over selected period</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
          {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                activeMetric === key
                  ? "bg-[#10E29C] text-black shadow-lg shadow-[#10E29C]/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
              data-testid={`button-trend-${key}`}
            >
              {METRIC_CONFIG[key].label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10E29C" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10E29C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: "hsl(235 10% 50%)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(235 10% 50%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => cfg.prefix ? `${cfg.prefix}${v}` : `${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke="#10E29C"
              strokeWidth={2}
              fill="url(#trendGrad)"
              dot={false}
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
