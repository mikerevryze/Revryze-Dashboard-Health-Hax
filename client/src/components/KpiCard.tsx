import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  sparklineData?: number[];
  trendPercent?: number | null;
  progressRing?: { value: number; label: string } | null;
  colorCode?: "green" | "yellow" | "red" | null;
  testId: string;
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <svg width="44" height="44" className="rotate-[-90deg]">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={radius} fill="none"
          stroke="#10E29C" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function KpiCard({ title, value, icon: Icon, sparklineData, trendPercent, progressRing, colorCode, testId }: KpiCardProps) {
  const chartData = useMemo(() => {
    if (!sparklineData?.length) return null;
    return sparklineData.map((v, i) => ({ v, i }));
  }, [sparklineData]);

  const valueColorClass = colorCode === "green"
    ? "text-[#10E29C]"
    : colorCode === "yellow"
      ? "text-amber-400"
      : colorCode === "red"
        ? "text-red-400"
        : "text-foreground";

  return (
    <div className="glass-card group relative overflow-hidden rounded-xl p-5" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground" data-testid={`label-${testId}`}>
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${valueColorClass}`} data-testid={`value-${testId}`}>
            {value}
          </p>
          {trendPercent !== undefined && trendPercent !== null && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trendPercent >= 0 ? "text-[#10E29C]" : "text-red-400"}`} data-testid={`trend-${testId}`}>
              {trendPercent >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{trendPercent >= 0 ? "+" : ""}{trendPercent.toFixed(1)}% vs prev period</span>
            </div>
          )}
          {progressRing && <div className="mt-2"><ProgressRing value={progressRing.value} label={progressRing.label} /></div>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
          <Icon className="h-5 w-5 text-[#10E29C]" />
        </div>
      </div>
      {chartData && (
        <div className="mt-3 h-12 w-full sparkline-glow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`sparkGrad-${testId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10E29C" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10E29C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#10E29C"
                strokeWidth={1.5}
                fill={`url(#sparkGrad-${testId})`}
                dot={false}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
