import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface MembershipEconomicsProps {
  membershipsSold: number;
  onValuesChange?: (monthlyRevenue: number, effectiveLifetime: number) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

type LtvMode = "lifetime" | "churn";

export function MembershipEconomics({ membershipsSold, onValuesChange }: MembershipEconomicsProps) {
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [ltvMode, setLtvMode] = useState<LtvMode>("lifetime");
  const [lifetimeInput, setLifetimeInput] = useState("");
  const [churnInput, setChurnInput] = useState("");

  const monthlyRev = parseFloat(monthlyRevenue) || 0;
  const rawLifetime = parseFloat(lifetimeInput) || 0;
  const rawChurn = parseFloat(churnInput) || 0;

  const effectiveLifetime =
    ltvMode === "lifetime"
      ? rawLifetime
      : rawChurn > 0
        ? 1 / (rawChurn / 100)
        : 0;

  const effectiveChurn =
    ltvMode === "churn"
      ? rawChurn
      : rawLifetime > 0
        ? (1 / rawLifetime) * 100
        : 0;

  const ltvPerMember = monthlyRev * effectiveLifetime;
  const totalLtv = membershipsSold * ltvPerMember;

  const hasInputs = monthlyRev > 0 && effectiveLifetime > 0;

  useEffect(() => {
    onValuesChange?.(monthlyRev, effectiveLifetime);
  }, [monthlyRev, effectiveLifetime, onValuesChange]);

  return (
    <div className="glass-card rounded-xl p-6" data-testid="panel-membership-economics">
      <h3 className="mb-1 text-base font-bold text-foreground">Membership Economics</h3>
      <p className="mb-5 text-xs text-muted-foreground">LTV modeling based on revenue &amp; retention</p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monthly Revenue Per Member
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 150"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(e.target.value)}
              className="border-white/10 bg-white/5 pl-7 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-[#10E29C]/40"
              data-testid="input-monthly-revenue"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1 rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setLtvMode("lifetime")}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                ltvMode === "lifetime"
                  ? "bg-[#10E29C] text-black shadow-lg shadow-[#10E29C]/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
              data-testid="button-mode-lifetime"
            >
              Avg Lifetime (Months)
            </button>
            <button
              onClick={() => setLtvMode("churn")}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                ltvMode === "churn"
                  ? "bg-[#10E29C] text-black shadow-lg shadow-[#10E29C]/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
              data-testid="button-mode-churn"
            >
              Monthly Churn (%)
            </button>
          </div>

          {ltvMode === "lifetime" ? (
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 12"
              value={lifetimeInput}
              onChange={(e) => setLifetimeInput(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-[#10E29C]/40"
              data-testid="input-lifetime"
            />
          ) : (
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g. 8"
                value={churnInput}
                onChange={(e) => setChurnInput(e.target.value)}
                className="border-white/10 bg-white/5 pr-7 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-[#10E29C]/40"
                data-testid="input-churn"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
            </div>
          )}
        </div>
      </div>

      {hasInputs && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Effective Lifetime</span>
            <span className="text-lg font-bold text-foreground" data-testid="value-effective-lifetime">
              {effectiveLifetime.toFixed(1)} mo
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Effective Churn</span>
            <span className="text-lg font-bold text-foreground" data-testid="value-effective-churn">
              {effectiveChurn.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">LTV Per Member</span>
            <span className="text-lg font-bold text-[#10E29C]" data-testid="value-ltv-per-member">
              {formatCurrency(ltvPerMember)}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[#10E29C]/20 bg-[#10E29C]/5 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total LTV of Sales to Date</span>
            <span className="text-lg font-bold text-[#10E29C]" data-testid="value-total-ltv">
              {formatCurrency(totalLtv)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
