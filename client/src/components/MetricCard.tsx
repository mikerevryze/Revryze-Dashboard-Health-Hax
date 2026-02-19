import { Card } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
}

export function MetricCard({ title, value, icon: Icon, subtitle }: MetricCardProps) {
  return (
    <Card className="group relative overflow-visible border-card-border bg-card p-5 hover-elevate">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground" data-testid={`text-metric-label-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl" data-testid={`text-metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#10E29C]/10">
          <Icon className="h-5 w-5 text-[#10E29C]" />
        </div>
      </div>
    </Card>
  );
}
