import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DollarSign, Users, Trophy, Target, CalendarCheck } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { SpendLeadsChart } from "@/components/SpendLeadsChart";
import { CpmTrendChart } from "@/components/CpmTrendChart";
import { TrendsChart } from "@/components/TrendsChart";
import { LeadSourceDonut } from "@/components/DonutCharts";
import { MembershipEconomics } from "@/components/MembershipEconomics";
import { ScenarioPanel } from "@/components/ScenarioPanel";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metrics, MetaMetrics, MetaDaily, FunnelStage, DailyMetrics, LeadsBreakdown } from "@shared/schema";

function SkeletonCard() {
  return (
    <div className="glass-card skeleton-pulse rounded-xl p-5">
      <Skeleton className="mb-3 h-3 w-24 bg-white/5" />
      <Skeleton className="h-9 w-32 bg-white/5" />
      <Skeleton className="mt-3 h-10 w-full bg-white/5" />
    </div>
  );
}

type ViewMode = "performance" | "scenarios";

export default function Dashboard() {
  const [activeDays, setActiveDays] = useState<number | null>(30);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("performance");

  // Shared state for Membership Economics → Scenarios
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [effectiveLifetime, setEffectiveLifetime] = useState(0);

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

  const handleEconomicsChange = useCallback((rev: number, lifetime: number) => {
    setMonthlyRevenue(rev);
    setEffectiveLifetime(lifetime);
  }, []);

  // Derive Tours Scheduled count from funnel data
  const toursScheduledCount = funnel?.find(
    s => s.stage_name.toLowerCase().includes("tour scheduled") || s.stage_name.toLowerCase().includes("tours scheduled")
  )?.count ?? 0;

  return (
    <div className="relative">
      <div className="mesh-gradient pointer-events-none absolute inset-0 h-[400px]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-white/5 bg-background/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl" data-testid="text-dashboard-title">
                  {viewMode === "performance" ? "Performance Dashboard" : "Scenario Modeling"}
                </h1>
                <p className="text-xs text-muted-foreground">GHL Pipeline & Meta Ads &middot; Live from Snowflake</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Performance / Scenarios toggle */}
              <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
                <button
                  onClick={() => setViewMode("performance")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    viewMode === "performance"
                      ? "bg-[#10E29C] text-black shadow-lg shadow-[#10E29C]/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  data-testid="button-view-performance"
                >
                  Performance
                </button>
                <button
                  onClick={() => setViewMode("scenarios")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    viewMode === "scenarios"
                      ? "bg-[#10E29C] text-black shadow-lg shadow-[#10E29C]/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  data-testid="button-view-scenarios"
                >
                  Scenarios
                </button>
              </div>
              {viewMode === "performance" && (
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  activeDays={activeDays}
                  onPresetChange={handlePresetChange}
                  lastUpdated={lastUpdated}
                />
              )}
            </div>
          </div>
        </div>

        {metricsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : metrics ? (
          <>
            {/* KPI Cards — always visible */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                title="Total Leads"
                rawValue={metrics.total_leads}
                formatType="number"
                icon={Users}
                progressRing={{ value: convPct, label: `${convPct.toFixed(1)}% conv` }}
                sparklineData={sparkLeads}
                testId="kpi-total-leads"
                animDelay={100}
              />
              <KpiCard
                title="Tours Scheduled"
                rawValue={toursScheduledCount}
                formatType="number"
                icon={CalendarCheck}
                testId="kpi-tours-scheduled"
                animDelay={200}
              />
              <KpiCard
                title="Memberships Sold"
                rawValue={metrics.closed_won}
                formatType="number"
                icon={Trophy}
                sparklineData={sparkWon}
                testId="kpi-memberships"
                animDelay={300}
              />
              <KpiCard
                title="Cost Per Member"
                rawValue={cpm}
                formatType="currency"
                icon={Target}
                colorCode={cpmColor}
                sparklineData={sparkCpl}
                testId="kpi-cpm"
                animDelay={400}
              />
            </div>

            {viewMode === "performance" ? (
              <>
                {/* Lead Source Donut + Membership Economics */}
                <div className="card-animate mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2" style={{ animationDelay: "500ms" }}>
                  {leadsBreakdown && <LeadSourceDonut breakdown={leadsBreakdown} />}
                  <MembershipEconomics
                    membershipsSold={metrics.closed_won}
                    onValuesChange={handleEconomicsChange}
                  />
                </div>

                {/* Trends chart */}
                {dailyMetrics && dailyMetrics.length > 0 && (
                  <div className="card-animate mt-6" style={{ animationDelay: "600ms" }}>
                    <TrendsChart data={dailyMetrics} />
                  </div>
                )}

                {/* Daily Spend & Leads + Cost Per Member Trend — side by side */}
                <div className="card-animate mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2" style={{ animationDelay: "700ms" }}>
                  {daily && daily.length > 0 && <SpendLeadsChart data={daily} />}
                  {daily && daily.length > 0 && metrics && (
                    <CpmTrendChart dailyData={daily} closedWon={metrics.closed_won} targetCpm={200} />
                  )}
                </div>
              </>
            ) : (
              /* Scenarios View */
              <div className="card-animate mt-6" style={{ animationDelay: "500ms" }}>
                <ScenarioPanel
                  membershipsSold={metrics.closed_won}
                  totalLeads={metrics.total_leads}
                  totalSpend={meta?.total_spend ?? 0}
                  monthlyRevenue={monthlyRevenue}
                  effectiveLifetime={effectiveLifetime}
                />
              </div>
            )}
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
