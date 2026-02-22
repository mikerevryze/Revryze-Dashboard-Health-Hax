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
import { TrendsChart } from "@/components/TrendsChart";
import { LeadSourceDonut, PipelineDonut } from "@/components/DonutCharts";
import { GoalCalculator } from "@/components/GoalCalculator";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metrics, MetaMetrics, MetaDaily, Campaign, FunnelStage, DailyMetrics, LeadsBreakdown } from "@shared/schema";

function SkeletonCard() {
  return (
    <div className="glass-card skeleton-pulse rounded-xl p-5">
      <Skeleton className="mb-3 h-3 w-24 bg-white/5" />
      <Skeleton className="h-9 w-32 bg-white/5" />
      <Skeleton className="mt-3 h-10 w-full bg-white/5" />
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
  const { data: dailyMetrics } = useQuery<DailyMetrics[]>({ queryKey: [`/api/daily-metrics${querySuffix}`], refetchInterval: 60000 });
  const { data: leadsBreakdown } = useQuery<LeadsBreakdown>({ queryKey: [`/api/leads-breakdown${querySuffix}`], refetchInterval: 60000 });

  useEffect(() => {
    if (metrics) setLastUpdated(new Date());
  }, [metrics]);

  const cpm = (meta?.total_spend && metrics?.closed_won && metrics.closed_won > 0)
    ? meta.total_spend / metrics.closed_won
    : 0;
  const cpmColor: "green" | "yellow" | "red" | null = cpm === 0 ? null : cpm < 150 ? "green" : cpm < 250 ? "yellow" : "red";
  const convPct = metrics?.conversion_rate ? metrics.conversion_rate * 100 : 0;

  const sparkSpend = dailyMetrics?.map(d => d.spend) || [];
  const sparkLeads = dailyMetrics?.map(d => d.leads) || [];
  const sparkWon = dailyMetrics?.map(d => d.closed_won) || [];
  const sparkCpl = dailyMetrics?.map(d => d.cpl) || [];

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
                rawValue={meta?.total_spend ?? 0}
                formatType="currency"
                icon={DollarSign}
                sparklineData={sparkSpend}
                testId="kpi-total-spend"
                animDelay={0}
              />
              <KpiCard
                title="Memberships Sold"
                rawValue={metrics.closed_won}
                formatType="number"
                icon={Trophy}
                sparklineData={sparkWon}
                testId="kpi-memberships"
                animDelay={100}
              />
              <KpiCard
                title="Cost Per Member"
                rawValue={cpm}
                formatType="currency"
                icon={Target}
                colorCode={cpmColor}
                sparklineData={sparkCpl}
                testId="kpi-cpm"
                animDelay={200}
              />
              <KpiCard
                title="Total Leads"
                rawValue={metrics.total_leads}
                formatType="number"
                icon={Users}
                progressRing={{ value: convPct, label: `${convPct.toFixed(1)}% conv` }}
                sparklineData={sparkLeads}
                testId="kpi-total-leads"
                animDelay={300}
              />
            </div>

            {leadsBreakdown && (
              <div className="card-animate mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2" style={{ animationDelay: "400ms" }}>
                <LeadSourceDonut breakdown={leadsBreakdown} />
                {funnel && funnel.length > 0 && <PipelineDonut funnel={funnel} />}
              </div>
            )}

            {dailyMetrics && dailyMetrics.length > 0 && (
              <div className="card-animate mt-6" style={{ animationDelay: "500ms" }}>
                <TrendsChart data={dailyMetrics} />
              </div>
            )}

            <div className="card-animate mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2" style={{ animationDelay: "600ms" }}>
              {daily && daily.length > 0 && <SpendLeadsChart data={daily} />}
              {funnel && funnel.length > 0 && <FunnelChart funnel={funnel} />}
            </div>

            <div className="card-animate mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2" style={{ animationDelay: "700ms" }}>
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
