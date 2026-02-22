import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { MetaDaily } from "@shared/schema";

interface SpendLeadsChartProps {
  data: MetaDaily[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const spend = payload.find((p: any) => p.dataKey === "spend")?.value || 0;
  const leads = payload.find((p: any) => p.dataKey === "leads")?.value || 0;
  const cpl = leads > 0 ? spend / leads : 0;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0F1223]/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1 text-sm">
        <p className="text-[#10E29C]">Spend: <span className="font-semibold">${spend.toFixed(2)}</span></p>
        <p className="text-[#6366F1]">Leads: <span className="font-semibold">{leads}</span></p>
        <p className="text-muted-foreground">CPL: <span className="font-semibold">${cpl.toFixed(2)}</span></p>
      </div>
    </div>
  );
}

export function SpendLeadsChart({ data }: SpendLeadsChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    displayDate: d.date ? new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
  }));

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="mb-1 text-base font-bold text-foreground" data-testid="text-chart-title-spend">Daily Spend & Leads</h3>
      <p className="mb-5 text-xs text-muted-foreground">Meta ad spend and lead generation over time</p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10E29C" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10E29C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
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
              yAxisId="spend"
              orientation="left"
              tick={{ fontSize: 11, fill: "hsl(235 10% 50%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              yAxisId="leads"
              orientation="right"
              tick={{ fontSize: 11, fill: "hsl(235 10% 50%)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="spend"
              type="monotone"
              dataKey="spend"
              stroke="#10E29C"
              strokeWidth={2}
              fill="url(#spendGrad)"
              dot={false}
              animationDuration={800}
            />
            <Area
              yAxisId="leads"
              type="monotone"
              dataKey="leads"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#leadsGrad)"
              dot={false}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
