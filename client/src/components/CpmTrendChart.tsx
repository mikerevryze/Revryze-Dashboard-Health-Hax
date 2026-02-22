import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, ReferenceArea,
} from "recharts";
import type { MetaDaily } from "@shared/schema";

interface CpmTrendChartProps {
  dailyData: MetaDaily[];
  closedWon: number;
  targetCpm: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const cpm = payload[0]?.value || 0;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0F1223]/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">${cpm.toFixed(2)} <span className="text-xs text-muted-foreground">per member</span></p>
    </div>
  );
}

export function CpmTrendChart({ dailyData, closedWon, targetCpm }: CpmTrendChartProps) {
  const weeklyBuckets: { week: string; cpm: number }[] = [];
  const weekMap = new Map<string, { spend: number; count: number }>();

  for (const d of dailyData) {
    if (!d.date) continue;
    const dt = new Date(d.date + "T00:00:00");
    const weekStart = new Date(dt);
    weekStart.setDate(dt.getDate() - dt.getDay());
    const key = weekStart.toISOString().split("T")[0];
    const existing = weekMap.get(key) || { spend: 0, count: 0 };
    existing.spend += d.spend;
    existing.count++;
    weekMap.set(key, existing);
  }

  const totalDays = dailyData.length || 1;
  const wonPerDay = closedWon / totalDays;

  for (const [week, { spend, count }] of Array.from(weekMap.entries())) {
    const membersThisWeek = Math.max(wonPerDay * count, 0.1);
    weeklyBuckets.push({
      week: new Date(week + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cpm: spend / membersThisWeek,
    });
  }

  weeklyBuckets.sort((a, b) => a.week.localeCompare(b.week));

  const maxCpm = Math.max(...weeklyBuckets.map(b => b.cpm), targetCpm * 1.5);

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="mb-1 text-base font-bold text-foreground" data-testid="text-chart-title-cpm">Cost Per Member Trend</h3>
      <p className="mb-5 text-xs text-muted-foreground">Weekly CPM with target line at ${targetCpm}</p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyBuckets} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "hsl(235 10% 50%)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(235 10% 50%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              domain={[0, maxCpm]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceArea y1={0} y2={targetCpm} fill="#10E29C" fillOpacity={0.03} />
            <ReferenceArea y1={targetCpm} y2={maxCpm} fill="#ef4444" fillOpacity={0.03} />
            <ReferenceLine
              y={targetCpm}
              stroke="#10E29C"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{ value: `Target $${targetCpm}`, position: "right", fill: "#10E29C", fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="cpm"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ fill: "#6366F1", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#6366F1", stroke: "#fff", strokeWidth: 2 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
