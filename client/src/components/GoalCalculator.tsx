import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Target, Users, DollarSign, Gift } from "lucide-react";

interface GoalCalculatorProps {
  totalLeads: number;
  closedWon: number;
  metaCpl: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function GoalCalculator({ totalLeads, closedWon, metaCpl }: GoalCalculatorProps) {
  const [goalInput, setGoalInput] = useState("");
  const [popipsInput, setPopipsInput] = useState("");

  const conversionRate = totalLeads > 0 ? closedWon / totalLeads : 0;
  const goal = parseFloat(goalInput) || 0;
  const popips = parseFloat(popipsInput) || 0;

  const totalLeadsNeeded = conversionRate > 0 ? Math.ceil(goal / conversionRate) : 0;
  const paidLeadsNeeded = Math.max(0, totalLeadsNeeded - popips);
  const additionalMetaSpend = paidLeadsNeeded * metaCpl;

  return (
    <Card className="relative border-[#10E29C]/30 bg-card p-6">
      <div className="mb-1 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#10E29C]/10">
          <Target className="h-5 w-5 text-[#10E29C]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Goal Calculator</h2>
          <p className="text-xs text-muted-foreground">
            Estimate Meta spend needed to hit your target
          </p>
        </div>
      </div>

      {conversionRate > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Current conversion rate: <span className="font-semibold text-[#10E29C]">{(conversionRate * 100).toFixed(1)}%</span>
          {" "}&middot; Meta CPL: <span className="font-semibold text-[#10E29C]">{formatCurrency(metaCpl)}</span>
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="goal-input"
            className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Goal (New Memberships)
          </label>
          <Input
            id="goal-input"
            type="number"
            min="0"
            placeholder="e.g. 20"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            className="border-[#10E29C]/20 bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-[#10E29C]/40"
          />
        </div>
        <div>
          <label
            htmlFor="popips-input"
            className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Popips (Free Organic Leads)
          </label>
          <Input
            id="popips-input"
            type="number"
            min="0"
            placeholder="e.g. 5"
            value={popipsInput}
            onChange={(e) => setPopipsInput(e.target.value)}
            className="border-[#10E29C]/20 bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-[#10E29C]/40"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#10E29C]" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Leads Needed
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {goal > 0 ? totalLeadsNeeded.toLocaleString() : "--"}
          </p>
        </div>

        <div className="rounded-md border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-[#10E29C]" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Paid Leads Needed
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {goal > 0 ? paidLeadsNeeded.toLocaleString() : "--"}
          </p>
        </div>

        <div className="rounded-md border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-[#10E29C]" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Meta Spend Needed
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {goal > 0 ? formatCurrency(additionalMetaSpend) : "--"}
          </p>
        </div>
      </div>
    </Card>
  );
}
