import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DollarSign, Users, Trophy, Target } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { SpendLeadsChart } from "@/components/SpendLeadsChart";
import { FunnelChart } from "@/components/FunnelChart";
import { CampaignTable } from "@/components/CampaignTable";
import { CpmTrendChart } from "@/components/CpmTrendChart";
import { GoalCalculator } from "@/components/GoalCalculator";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metrics, MetaMetrics, MetaDaily, Campaign, FunnelStage } from "@shared/schema";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl p-5">
      <Skeleton className="mb-3 h-3 w-24 bg-white/5" />
      <Skeleton className="h-9 w-32 bg-white/5" />
      <Skeleton className="mt-3 h-12 w-full bg-white/5" />
    </div>
  );
}

export default function Dashboard() {
  const [activeDays, setActiveDays] = useState<number | null>(30);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  let querySuffix = "";
  if (activeDays !== null) {
    querySuffix = activeDays > 0 ? `?days=${activeDays}` : "";
  } else if (dateRange?.from && dateRange?.to) {
    querySuffix = `?start_date=${format(dateRange.from, "yyyy-MM-dd")}&end_date=${format(dateRange.to, "yyyy-MM-dd")}`;
  }

  const handlePresetChange = (days: number) => { setActiveDays(days); setDateRange(undefined); };
  const handleDateRangeChange = (range: DateRange | undefined) => { setDateRange(range); if (range?.from) setActiveDays(null); };

  const { data: metrics, isLoading: metricsLoading } = useQuery<Metrics>({ queryKey: [`/api/metrics${querySuffix}`], refetchInterval: 60000 });
  const { data: meta } = useQuery<MetaMetrics>({ queryKey: [`/api/meta${querySuffix}`], refetchInterval: 60000 });
  const { data: daily } = useQuery<MetaDaily[]>({ queryKey: [`/api/meta/daily${querySuffix}`], refetchInterval: 60000 });
  const { data: campaigns } = useQuery<Campaign[]>({ queryKey: [`/api/meta/campaigns${querySuffix}`], refetchInterval: 60000 });
  const { data: funnel } = useQuery<FunnelStage[]>({ queryKey: [`/api/funnel${querySuffix}`], refetchInterval: 60000 });

  useEffect(() => {
    if (metrics) setLastUpdated(new Date());
  }, [metrics]);

  const sparklineSpend = daily?.map(d => d.spend) || [];
  const cpm = (meta?.total_spend && metrics?.closed_won && metrics.closed_won > 0)
    ? meta.total_spend / metrics.closed_won
    : 0;
  const cpmColor: "green" | "yellow" | "red" | null = cpm === 0 ? null : cpm < 150 ? "green" : cpm < 250 ? "yellow" : "red";
  const convPct = metrics?.conversion_rate ? metrics.conversion_rate * 100 : 0;

  return (
    <div className="relative">
      <div className="mesh-gradient pointer-events-none absolute inset-0 h-[400px]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-white/5 bg-background/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl" data-testid="text-dashboard-title">Performance Dashboard</h1>
              <p className="text-xs text-muted-foreground">GHL Pipeline & Meta Ads &middot; Live from Snowflake</p>
            </div>
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
              activeDays={activeDays}
              onPresetChange={handlePresetChange}
              lastUpdated={lastUpdated}
            />
          </div>
        </div>

        {metricsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : metrics ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total Ad Spend"
                value={meta ? formatCurrency(meta.total_spend) : "$0"}
                icon={DollarSign}
                sparklineData={sparklineSpend}
                testId="kpi-total-spend"
              />
              <KpiCard
                title="Memberships Sold"
                value={metrics.closed_won.toLocaleString()}
                icon={Trophy}
                trendPercent={null}
                testId="kpi-memberships"
              />
              <KpiCard
                title="Cost Per Member"
                value={cpm > 0 ? formatCurrency(cpm) : "--"}
                icon={Target}
                colorCode={cpmColor}
                testId="kpi-cpm"
              />
              <KpiCard
                title="Total Leads"
                value={metrics.total_leads.toLocaleString()}
                icon={Users}
                progressRing={{ value: convPct, label: `${convPct.toFixed(1)}% conv` }}
                testId="kpi-total-leads"
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {daily && daily.length > 0 && <SpendLeadsChart data={daily} />}
              {funnel && funnel.length > 0 && <FunnelChart funnel={funnel} />}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {campaigns && campaigns.length > 0 && <CampaignTable campaigns={campaigns} />}
              {daily && daily.length > 0 && metrics && (
                <CpmTrendChart dailyData={daily} closedWon={metrics.closed_won} targetCpm={200} />
              )}
            </div>

            <GoalCalculator
              totalLeads={metrics.total_leads}
              closedWon={metrics.closed_won}
              metaCpl={meta?.cpl ?? 0}
              metaSpend={meta?.total_spend ?? 0}
            />
          </>
        ) : (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
