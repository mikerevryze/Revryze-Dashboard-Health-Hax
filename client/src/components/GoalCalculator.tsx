import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Target, Users, DollarSign } from "lucide-react";
import type { Metrics } from "@shared/schema";

interface GoalCalculatorProps {
  metrics: Metrics;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function GoalCalculator({ metrics }: GoalCalculatorProps) {
  const [goalMemberships, setGoalMemberships] = useState<string>("");

  const conversionRate =
    metrics.total_leads > 0
      ? metrics.closed_won_count / metrics.total_leads
      : 0;

  const cpl =
    metrics.total_leads > 0
      ? metrics.total_spend / metrics.total_leads
      : 0;

  const goalNum = parseFloat(goalMemberships) || 0;
  const requiredLeads = conversionRate > 0 ? goalNum / conversionRate : 0;
  const requiredSpend = requiredLeads * cpl;

  return (
    <Card className="relative border-[#10E29C]/30 bg-card p-6">
      <div className="mb-1 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#10E29C]/10">
          <Target className="h-5 w-5 text-[#10E29C]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Goal Calculator</h2>
          <p className="text-xs text-muted-foreground">
            Estimate ad spend needed to hit your membership target
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="goal-input"
          className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          Goal Membership Count
        </label>
        <Input
          id="goal-input"
          data-testid="input-goal-memberships"
          type="number"
          min="0"
          placeholder="Enter target memberships..."
          value={goalMemberships}
          onChange={(e) => setGoalMemberships(e.target.value)}
          className="border-[#10E29C]/20 bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-[#10E29C]/40"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#10E29C]" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Required Leads
            </span>
          </div>
          <p
            className="mt-2 text-2xl font-bold text-foreground"
            data-testid="text-required-leads"
          >
            {goalNum > 0 ? formatNumber(Math.ceil(requiredLeads)) : "--"}
          </p>
        </div>

        <div className="rounded-md border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#10E29C]" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Required Spend
            </span>
          </div>
          <p
            className="mt-2 text-2xl font-bold text-foreground"
            data-testid="text-required-spend"
          >
            {goalNum > 0 ? formatCurrency(requiredSpend) : "--"}
          </p>
        </div>
      </div>
    </Card>
  );
}
