import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface ScenarioPanelProps {
  membershipsSold: number;
  totalLeads: number;
  totalSpend: number;
  /** Monthly revenue per member, passed from MembershipEconomics state */
  monthlyRevenue: number;
  /** Effective member lifetime in months */
  effectiveLifetime: number;
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
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export function ScenarioPanel({
  membershipsSold,
  totalLeads,
  totalSpend,
  monthlyRevenue,
  effectiveLifetime,
}: ScenarioPanelProps) {
  // Default deadline 90 days from now
  const defaultDeadline = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d;
  }, []);

  const [deadline, setDeadline] = useState<Date>(defaultDeadline);
  const [calOpen, setCalOpen] = useState(false);
  const [daysElapsedInput, setDaysElapsedInput] = useState("");
  const [additionalCommunityLeads, setAdditionalCommunityLeads] = useState("");
  const [additionalAdSpend, setAdditionalAdSpend] = useState("");

  const daysElapsed = parseFloat(daysElapsedInput) || 0;
  const daysRemaining = Math.max(0, differenceInDays(deadline, new Date()));

  // Derived rates from actual data
  const conversionRate = totalLeads > 0 ? membershipsSold / totalLeads : 0;
  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const ltvPerMember = monthlyRevenue * effectiveLifetime;

  // Section A — Sales Velocity
  const currentVelocity = daysElapsed > 0 ? membershipsSold / daysElapsed : 0;
  const projectedAdditionalSales = currentVelocity * daysRemaining;
  const projectedTotalMemberships = membershipsSold + projectedAdditionalSales;
  const projectedTotalLtv = projectedTotalMemberships * ltvPerMember;

  // Section B — Growth Scenario
  const extraSpend = parseFloat(additionalAdSpend) || 0;
  const extraCommunityLeads = parseFloat(additionalCommunityLeads) || 0;
  const additionalLeadsFromSpend = cpl > 0 ? extraSpend / cpl : 0;
  const totalAdditionalLeads = additionalLeadsFromSpend + extraCommunityLeads;
  const additionalProjectedMemberships = totalAdditionalLeads * conversionRate;
  const newProjectedTotalSales = projectedTotalMemberships + additionalProjectedMemberships;
  const newProjectedTotalLtv = newProjectedTotalSales * ltvPerMember;

  const hasVelocityInputs = daysElapsed > 0;
  const hasGrowthInputs = extraSpend > 0 || extraCommunityLeads > 0;

  return (
    <div className="space-y-6">
      {/* Section A — Sales Velocity Projection */}
      <div className="glass-card rounded-xl p-6" data-testid="panel-sales-velocity">
        <h3 className="mb-1 text-base font-bold text-foreground">Sales Velocity Projection</h3>
        <p className="mb-5 text-xs text-muted-foreground">
          Project membership sales based on current pace
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Engagement Deadline
            </label>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/10 bg-white/5 text-left font-normal hover:bg-white/10"
                  data-testid="button-deadline-picker"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(deadline, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-white/10 bg-[#0A0A1A] p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(d) => { if (d) { setDeadline(d); setCalOpen(false); } }}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Memberships Sold to Date
              </label>
              <div className="flex h-10 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm text-foreground">
                {membershipsSold.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Days Elapsed
              </label>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 30"
                value={daysElapsedInput}
                onChange={(e) => setDaysElapsedInput(e.target.value)}
                className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-[#10E29C]/40"
                data-testid="input-days-elapsed"
              />
            </div>
          </div>

          {/* Current metrics bar */}
          <div className="flex items-center gap-4 rounded-lg bg-white/5 px-4 py-3">
            <div className="text-center">
              <p className="text-lg font-bold text-[#10E29C]">{(conversionRate * 100).toFixed(1)}%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Conv Rate</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{cpl > 0 ? formatCurrency(cpl) : "--"}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPL</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{daysRemaining}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Days Left</p>
            </div>
          </div>
        </div>

        {hasVelocityInputs && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Sales Velocity</span>
              <span className="text-lg font-bold text-foreground" data-testid="value-sales-velocity">
                {currentVelocity.toFixed(2)}/day
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Projected Add'l Sales</span>
              <span className="text-lg font-bold text-foreground" data-testid="value-projected-additional">
                {formatNumber(projectedAdditionalSales)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Projected Memberships</span>
              <span className="text-lg font-bold text-[#10E29C]" data-testid="value-projected-total">
                {formatNumber(projectedTotalMemberships)}
              </span>
            </div>
            {ltvPerMember > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-[#10E29C]/20 bg-[#10E29C]/5 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Projected Total LTV</span>
                <span className="text-lg font-bold text-[#10E29C]" data-testid="value-projected-ltv">
                  {formatCurrency(projectedTotalLtv)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section B — Growth Scenario Inputs */}
      <div className="glass-card rounded-xl p-6" data-testid="panel-growth-scenario">
        <h3 className="mb-1 text-base font-bold text-foreground">Growth Scenario</h3>
        <p className="mb-5 text-xs text-muted-foreground">
          Model impact of additional spend &amp; community leads
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Additional Community Leads Expected
            </label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 50"
              value={additionalCommunityLeads}
              onChange={(e) => setAdditionalCommunityLeads(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-[#10E29C]/40"
              data-testid="input-community-leads"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Additional Ad Spend Planned
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={additionalAdSpend}
                onChange={(e) => setAdditionalAdSpend(e.target.value)}
                className="border-white/10 bg-white/5 pl-7 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-[#10E29C]/40"
                data-testid="input-additional-spend"
              />
            </div>
          </div>
        </div>

        {hasGrowthInputs && (
          <div className="mt-5 space-y-3">
            {extraSpend > 0 && cpl > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Add'l Leads from Spend</span>
                <span className="text-lg font-bold text-foreground" data-testid="value-leads-from-spend">
                  {formatNumber(additionalLeadsFromSpend)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Add'l Leads</span>
              <span className="text-lg font-bold text-foreground" data-testid="value-total-additional-leads">
                {formatNumber(totalAdditionalLeads)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Add'l Projected Memberships</span>
              <span className="text-lg font-bold text-foreground" data-testid="value-additional-memberships">
                {formatNumber(additionalProjectedMemberships)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Projected Total Sales</span>
              <span className="text-lg font-bold text-[#10E29C]" data-testid="value-new-projected-total">
                {formatNumber(newProjectedTotalSales)}
              </span>
            </div>
            {ltvPerMember > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-[#10E29C]/20 bg-[#10E29C]/5 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Projected Total LTV</span>
                <span className="text-lg font-bold text-[#10E29C]" data-testid="value-new-projected-ltv">
                  {formatCurrency(newProjectedTotalLtv)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
