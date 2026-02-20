import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  DollarSign,
  Users,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { FunnelChart } from "@/components/FunnelChart";
import { RecentDeals } from "@/components/RecentDeals";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { Metrics, FunnelStage, RecentDeal } from "@shared/schema";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-card-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="border-destructive/30 bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          Unable to load metrics
        </h3>
        <p className="mt-2 text-sm text-muted-foreground" data-testid="text-error-message">
          {message}
        </p>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 60000,
  });

  const { data: funnel, isLoading: funnelLoading } = useQuery<FunnelStage[]>({
    queryKey: ["/api/funnel"],
    refetchInterval: 60000,
  });

  const { data: recent, isLoading: recentLoading } = useQuery<RecentDeal[]>({
    queryKey: ["/api/recent"],
    refetchInterval: 60000,
  });

  if (metricsLoading) return <LoadingSkeleton />;
  if (metricsError) return <ErrorState message={(metricsError as Error).message} />;
  if (!metrics) return <ErrorState message="No data available" />;

  const conversionRate =
    metrics.total_deals > 0
      ? ((metrics.won_deals / metrics.total_deals) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Performance Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          GHL Pipeline Stats &middot; Live from Snowflake
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Deals"
          value={metrics.total_deals.toLocaleString()}
          icon={Users}
          subtitle="All opportunities in pipeline"
        />
        <MetricCard
          title="Open Deals"
          value={metrics.open_deals.toLocaleString()}
          icon={Activity}
          subtitle="Currently active deals"
        />
        <MetricCard
          title="Won Deals"
          value={metrics.won_deals.toLocaleString()}
          icon={Trophy}
          subtitle="Closed won"
        />
        <MetricCard
          title="Lost Deals"
          value={metrics.lost_deals.toLocaleString()}
          icon={XCircle}
          subtitle="Closed lost"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          subtitle="Won / Total deals"
        />
        <MetricCard
          title="Total Value"
          value={formatCurrency(metrics.total_value)}
          icon={DollarSign}
          subtitle="Sum of all deal values"
        />
      </div>

      <div className="mt-8">
        {funnelLoading ? (
          <Card className="border-card-border bg-card p-6">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </Card>
        ) : funnel && funnel.length > 0 ? (
          <FunnelChart funnel={funnel} />
        ) : null}
      </div>

      <div className="mt-8">
        {recentLoading ? (
          <Card className="border-card-border bg-card p-6">
            <Skeleton className="mb-4 h-6 w-40" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </Card>
        ) : recent && recent.length > 0 ? (
          <RecentDeals deals={recent} />
        ) : null}
      </div>
    </div>
  );
}
