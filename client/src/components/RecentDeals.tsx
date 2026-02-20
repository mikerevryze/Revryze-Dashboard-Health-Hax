import { Card } from "@/components/ui/card";
import type { RecentDeal } from "@shared/schema";

interface RecentDealsProps {
  deals: RecentDeal[];
}

const statusStyles: Record<string, string> = {
  open: "bg-yellow-500/20 text-yellow-400",
  won: "bg-green-500/20 text-green-400",
  lost: "bg-red-500/20 text-red-400",
  abandoned: "bg-gray-500/20 text-gray-400",
};

export function RecentDeals({ deals }: RecentDealsProps) {
  return (
    <Card className="border-card-border bg-card p-6">
      <h2 className="mb-1 text-lg font-bold text-foreground">Recent Activity</h2>
      <p className="mb-5 text-xs text-muted-foreground">Last 10 updated deals</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="pb-3">Name</th>
              <th className="pb-3">Stage</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Value</th>
              <th className="pb-3 text-right">Updated</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal, i) => (
              <tr
                key={i}
                className="border-b border-border/50 transition-colors hover:bg-muted/30"
              >
                <td className="py-3 font-medium text-foreground">{deal.name}</td>
                <td className="py-3 text-muted-foreground">{deal.stage_name}</td>
                <td className="py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      statusStyles[deal.status] || "bg-muted text-muted-foreground"
                    }`}
                  >
                    {deal.status}
                  </span>
                </td>
                <td className="py-3 text-right text-muted-foreground">
                  ${(deal.value ?? 0).toLocaleString()}
                </td>
                <td className="py-3 text-right text-muted-foreground">
                  {deal.updated_at
                    ? new Date(deal.updated_at).toLocaleDateString()
                    : "\u2014"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
