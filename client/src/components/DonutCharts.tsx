import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import type { LeadsBreakdown, FunnelStage } from "@shared/schema";
import { useCountUp } from "@/hooks/useCountUp";

interface LeadSourceDonutProps {
  breakdown: LeadsBreakdown;
}

interface PipelineDonutProps {
  funnel: FunnelStage[];
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-[#0F1223]/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="text-xs font-medium text-muted-foreground">{name}</p>
      <p className="text-sm font-semibold text-foreground">{value.toLocaleString()}</p>
    </div>
  );
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 2}
      outerRadius={outerRadius + 4}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

export function LeadSourceDonut({ breakdown }: LeadSourceDonutProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const displayTotal = breakdown.meta_leads + breakdown.organic_leads;
  const animTotal = useCountUp(displayTotal, 1500);

  const data = [
    { name: "Meta (Paid)", value: breakdown.meta_leads },
    { name: "Organic/Other", value: breakdown.organic_leads },
  ];

  const COLORS = ["#10E29C", "rgba(16, 226, 156, 0.3)"];

  return (
    <div className="glass-card rounded-xl p-6" data-testid="chart-lead-source-donut">
      <h3 className="mb-1 text-base font-bold text-foreground" data-testid="text-chart-title-lead-source">Lead Sources</h3>
      <p className="mb-4 text-xs text-muted-foreground">Paid vs Organic breakdown</p>
      <div className="relative h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              activeIndex={activeIndex >= 0 ? activeIndex : undefined}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              animationDuration={800}
              isAnimationActive={true}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground" data-testid="value-donut-total">{animTotal.toLocaleString()}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Leads</span>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-4">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span>{d.name}: {d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const STAGE_COLORS = [
  "#10E29C",
  "rgba(16, 226, 156, 0.8)",
  "rgba(16, 226, 156, 0.6)",
  "rgba(16, 226, 156, 0.45)",
  "rgba(16, 226, 156, 0.3)",
  "rgba(16, 226, 156, 0.2)",
  "rgba(16, 226, 156, 0.15)",
  "rgba(16, 226, 156, 0.1)",
];

export function PipelineDonut({ funnel }: PipelineDonutProps) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const totalDeals = funnel.reduce((sum, s) => sum + s.count, 0);
  const animTotal = useCountUp(totalDeals, 1500);

  const data = funnel.map(s => ({ name: s.stage_name, value: s.count }));

  return (
    <div className="glass-card rounded-xl p-6" data-testid="chart-pipeline-donut">
      <h3 className="mb-1 text-base font-bold text-foreground" data-testid="text-chart-title-pipeline-donut">Pipeline Breakdown</h3>
      <p className="mb-4 text-xs text-muted-foreground">Active deals by stage</p>
      <div className="relative h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              activeIndex={activeIndex >= 0 ? activeIndex : undefined}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              animationDuration={800}
              isAnimationActive={true}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground" data-testid="value-pipeline-total">{animTotal.toLocaleString()}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Deals</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[i % STAGE_COLORS.length] }} />
            <span>{d.name}: {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
