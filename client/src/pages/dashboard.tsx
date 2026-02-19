import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  DollarSign,
  Megaphone,
  UserCheck,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { GoalCalculator } from "@/components/GoalCalculator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { Metrics } from "@shared/schema";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
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
      <div className="mt-8">
        <Card className="border-card-border bg-card p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <Skeleton className="mt-5 h-9 w-full" />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-md" />
            <Skeleton className="h-24 rounded-md" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="border-destructive/30 bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <Megaphone className="h-6 w-6 text-destructive" />
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
  const { data: metrics, isLoading, error } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={(error as Error).message} />;
  if (!metrics) return <ErrorState message="No data available" />;

  const cpl =
    metrics.total_leads > 0
      ? metrics.total_spend / metrics.total_leads
      : 0;

  const costPerMembership =
    metrics.closed_won_count > 0
      ? metrics.total_spend / metrics.closed_won_count
      : 0;

  const conversionRate =
    metrics.total_leads > 0
      ? metrics.closed_won_count / metrics.total_leads
      : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Performance Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time sales and advertising metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Closed Won Deals"
          value={metrics.closed_won_count.toLocaleString()}
          icon={Trophy}
          subtitle="Total deals closed"
        />
        <MetricCard
          title="Closed Won Revenue"
          value={formatCurrency(metrics.closed_won_value)}
          icon={DollarSign}
          subtitle="Total revenue from closed deals"
        />
        <MetricCard
          title="Total Ad Spend"
          value={formatCurrency(metrics.total_spend)}
          icon={Megaphone}
          subtitle="Cumulative ad investment"
        />
        <MetricCard
          title="Cost Per Lead"
          value={cpl > 0 ? formatCurrency(cpl) : "$0"}
          icon={UserCheck}
          subtitle="Average cost per lead generated"
        />
        <MetricCard
          title="Cost Per Membership"
          value={costPerMembership > 0 ? formatCurrency(costPerMembership) : "$0"}
          icon={CreditCard}
          subtitle="Ad spend per membership acquired"
        />
        <MetricCard
          title="Lead-to-Sale Rate"
          value={conversionRate > 0 ? formatPercent(conversionRate) : "0.00%"}
          icon={TrendingUp}
          subtitle="Conversion from lead to closed deal"
        />
      </div>

      <div className="mt-8">
        <GoalCalculator metrics={metrics} />
      </div>
    </div>
  );
}
