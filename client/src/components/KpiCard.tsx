import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface KpiCardProps {
  title: string;
  rawValue: number;
  formatType: "currency" | "number" | "percent";
  icon: LucideIcon;
  sparklineData?: number[];
  progressRing?: { value: number; label: string } | null;
  colorCode?: "green" | "yellow" | "red" | null;
  testId: string;
  animDelay?: number;
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

function formatAnimatedValue(value: number, type: "currency" | "number" | "percent"): string {
  if (type === "currency") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }
  if (type === "percent") {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
}

export function KpiCard({ title, rawValue, formatType, icon: Icon, sparklineData, progressRing, colorCode, testId, animDelay = 0 }: KpiCardProps) {
  const decimals = formatType === "percent" ? 1 : formatType === "currency" ? 0 : 0;
  const animatedValue = useCountUp(rawValue, 1500, decimals);

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

  const displayValue = rawValue === 0 && formatType === "currency" ? "--" : formatAnimatedValue(animatedValue, formatType);

  return (
    <div
      className="card-animate glass-card group relative overflow-hidden rounded-xl p-5"
      style={{ animationDelay: `${animDelay}ms` }}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground" data-testid={`label-${testId}`}>
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${valueColorClass}`} data-testid={`value-${testId}`}>
            {displayValue}
          </p>
          {progressRing && <div className="mt-2"><ProgressRing value={progressRing.value} label={progressRing.label} /></div>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
          <Icon className="h-5 w-5 text-[#10E29C]" />
        </div>
      </div>
      {chartData && (
        <div className="mt-3 h-10 w-full sparkline-glow">
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
