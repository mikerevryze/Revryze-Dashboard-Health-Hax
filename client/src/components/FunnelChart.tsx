import { useState, useEffect } from "react";
import type { FunnelStage } from "@shared/schema";

interface FunnelChartProps {
  funnel: FunnelStage[];
}

export function FunnelChart({ funnel }: FunnelChartProps) {
  const [animated, setAnimated] = useState(false);
  const maxCount = Math.max(...funnel.map((s) => s.count), 1);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [funnel]);

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="mb-1 text-base font-bold text-foreground" data-testid="text-chart-title-funnel">Pipeline Funnel</h3>
      <p className="mb-5 text-xs text-muted-foreground">Active deals by stage (excludes lost)</p>
      <div className="space-y-3">
        {funnel.map((stage, i) => {
          const pct = (stage.count / maxCount) * 100;
          const prevCount = i > 0 ? funnel[i - 1].count : null;
          const conversionPct = prevCount && prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(0) : null;
          return (
            <div key={`${stage.pipeline_name}-${stage.stage_name}-${i}`}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{stage.stage_name}</span>
                  {conversionPct && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {conversionPct}% conv
                    </span>
                  )}
                </div>
                <span className="tabular-nums text-muted-foreground">
                  {stage.count.toLocaleString()}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: animated ? `${pct}%` : "0%",
                    background: `linear-gradient(90deg, #10E29C, #6366F1)`,
                    transitionDelay: `${i * 100}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
