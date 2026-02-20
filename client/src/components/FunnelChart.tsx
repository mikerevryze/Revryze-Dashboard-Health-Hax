import { Card } from "@/components/ui/card";
import type { FunnelStage } from "@shared/schema";

interface FunnelChartProps {
  funnel: FunnelStage[];
}

export function FunnelChart({ funnel }: FunnelChartProps) {
  const maxCount = Math.max(...funnel.map((s) => s.count));

  return (
    <Card className="border-card-border bg-card p-6">
      <h2 className="mb-1 text-lg font-bold text-foreground">Pipeline Funnel</h2>
      <p className="mb-5 text-xs text-muted-foreground">
        Active deals by stage (excludes lost)
      </p>
      <div className="space-y-3">
        {funnel.map((stage, i) => (
          <div key={`${stage.pipeline_name}-${stage.stage_name}-${i}`}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{stage.stage_name}</span>
              <span className="text-muted-foreground">
                {stage.count} deal{stage.count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-3 rounded-full bg-[#10E29C] transition-all"
                style={{ width: `${(stage.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
