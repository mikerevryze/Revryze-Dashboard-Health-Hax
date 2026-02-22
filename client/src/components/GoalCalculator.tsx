import { useState, useEffect, useRef } from "react";
import { Calculator, X, Target, Users, DollarSign, Gift, TrendingUp, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCountUp } from "@/hooks/useCountUp";

interface GoalCalculatorProps {
  totalLeads: number;
  closedWon: number;
  metaCpl: number;
  metaSpend: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function GoalCalculator({ totalLeads, closedWon, metaCpl, metaSpend }: GoalCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [popipsInput, setPopipsInput] = useState("");
  const [targetCpmInput, setTargetCpmInput] = useState("200");
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const conversionRate = totalLeads > 0 ? closedWon / totalLeads : 0;
  const goal = parseFloat(goalInput) || 0;
  const popips = parseFloat(popipsInput) || 0;
  const targetCpm = parseFloat(targetCpmInput) || 200;

  const totalLeadsNeeded = conversionRate > 0 ? Math.ceil(goal / conversionRate) : 0;
  const paidLeadsNeeded = Math.max(0, totalLeadsNeeded - popips);
  const requiredSpend = paidLeadsNeeded * metaCpl;
  const projectedCpm = goal > 0 ? requiredSpend / goal : 0;
  const budgetGap = goal > 0 ? requiredSpend - (targetCpm * goal) : 0;
  const currentPace = closedWon > 0 ? metaSpend / closedWon : 0;

  const animLeadsNeeded = useCountUp(totalLeadsNeeded, 1500);
  const animPaidLeads = useCountUp(paidLeadsNeeded, 1500);
  const animRequiredSpend = useCountUp(requiredSpend, 1500);
  const animProjectedCpm = useCountUp(projectedCpm, 1500);
  const animBudgetGap = useCountUp(Math.abs(budgetGap), 1500);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#10E29C] text-black shadow-lg shadow-[#10E29C]/25 transition-all duration-300 hover:scale-110 hover:shadow-[#10E29C]/40"
        data-testid="button-open-calculator"
      >
        <Calculator className="h-6 w-6" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: isVisible ? 1 : 0 }}
            onClick={handleClose}
          />
          <div
            ref={panelRef}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/5 bg-[#0A0A1A]/95 backdrop-blur-xl transition-transform duration-300 ease-out"
            style={{ transform: isVisible ? "translateX(0)" : "translateX(100%)" }}
            data-testid="panel-goal-calculator"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10E29C]/10">
                  <Target className="h-5 w-5 text-[#10E29C]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Goal Calculator</h2>
                  <p className="text-xs text-muted-foreground">Estimate spend for targets</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                data-testid="button-close-calculator"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {conversionRate > 0 && (
                <div className="mb-5 flex items-center gap-4 rounded-lg bg-white/5 px-4 py-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#10E29C]">{(conversionRate * 100).toFixed(1)}%</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Conv Rate</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatCurrency(metaCpl)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Meta CPL</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{formatCurrency(currentPace)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current CPM</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Monthly Membership Goal
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 20"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-[#10E29C]/40"
                    data-testid="input-goal"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Organic/Popup Leads Expected
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={popipsInput}
                    onChange={(e) => setPopipsInput(e.target.value)}
                    className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-[#10E29C]/40"
                    data-testid="input-popips"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Target Cost Per Member
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="$200"
                    value={targetCpmInput}
                    onChange={(e) => setTargetCpmInput(e.target.value)}
                    className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-[#10E29C]/40"
                    data-testid="input-target-cpm"
                  />
                </div>
              </div>

              {goal > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-[#10E29C]" />
                      <span className="text-xs font-medium uppercase tracking-wider">Total Leads Needed</span>
                    </div>
                    <p className="mt-1.5 text-2xl font-bold text-foreground" data-testid="value-leads-needed">{animLeadsNeeded.toLocaleString()}</p>
                  </div>

                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gift className="h-4 w-4 text-[#6366F1]" />
                      <span className="text-xs font-medium uppercase tracking-wider">Paid Leads Needed</span>
                    </div>
                    <p className="mt-1.5 text-2xl font-bold text-foreground" data-testid="value-paid-leads">{animPaidLeads.toLocaleString()}</p>
                  </div>

                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-[#10E29C]" />
                      <span className="text-xs font-medium uppercase tracking-wider">Required Meta Spend</span>
                    </div>
                    <p className="mt-1.5 text-2xl font-bold text-[#10E29C]" data-testid="value-required-spend">{formatCurrency(animRequiredSpend)}</p>
                  </div>

                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Projected CPM</span>
                    </div>
                    <p className={`mt-1.5 text-2xl font-bold ${projectedCpm <= 150 ? "text-[#10E29C]" : projectedCpm <= 250 ? "text-amber-400" : "text-red-400"}`} data-testid="value-projected-cpm">
                      {formatCurrency(animProjectedCpm)}
                    </p>
                  </div>

                  <div className={`rounded-lg border p-4 ${budgetGap <= 0 ? "border-[#10E29C]/20 bg-[#10E29C]/5" : "border-red-500/20 bg-red-500/5"}`}>
                    <div className="flex items-center gap-2">
                      {budgetGap <= 0 ? <TrendingDown className="h-4 w-4 text-[#10E29C]" /> : <TrendingUp className="h-4 w-4 text-red-400" />}
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {budgetGap <= 0 ? "Budget Surplus" : "Budget Gap"}
                      </span>
                    </div>
                    <p className={`mt-1.5 text-2xl font-bold ${budgetGap <= 0 ? "text-[#10E29C]" : "text-red-400"}`} data-testid="value-budget-gap">
                      {formatCurrency(animBudgetGap)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {budgetGap <= 0 ? "Under target CPM budget" : "Over target CPM budget"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
