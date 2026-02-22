import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Campaign } from "@shared/schema";

interface CampaignTableProps {
  campaigns: Campaign[];
}

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

function fmtNumber(v: number) {
  return v.toLocaleString();
}

type SortKey = "spend" | "leads" | "cpl" | "impressions" | "clicks" | "ctr";

export function CampaignTable({ campaigns }: CampaignTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...campaigns].sort((a, b) => {
    const diff = (a[sortKey] || 0) - (b[sortKey] || 0);
    return sortAsc ? diff : -diff;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) { setSortAsc(!sortAsc); } else { setSortKey(key); setSortAsc(false); }
  };

  const thClass = "px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none";
  const tdClass = "px-3 py-2.5 text-sm tabular-nums";

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="p-6 pb-3">
        <h3 className="mb-1 text-base font-bold text-foreground" data-testid="text-chart-title-campaigns">Campaign Performance</h3>
        <p className="text-xs text-muted-foreground">Click a row to see adset breakdown</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="table-campaigns">
          <thead>
            <tr className="border-b border-white/5">
              <th className={thClass}>Campaign</th>
              <th className={thClass} onClick={() => handleSort("spend")}>Spend {sortKey === "spend" && (sortAsc ? "↑" : "↓")}</th>
              <th className={thClass} onClick={() => handleSort("leads")}>Leads {sortKey === "leads" && (sortAsc ? "↑" : "↓")}</th>
              <th className={thClass} onClick={() => handleSort("cpl")}>CPL {sortKey === "cpl" && (sortAsc ? "↑" : "↓")}</th>
              <th className={thClass} onClick={() => handleSort("impressions")}>Impr {sortKey === "impressions" && (sortAsc ? "↑" : "↓")}</th>
              <th className={thClass} onClick={() => handleSort("clicks")}>Clicks {sortKey === "clicks" && (sortAsc ? "↑" : "↓")}</th>
              <th className={thClass} onClick={() => handleSort("ctr")}>CTR {sortKey === "ctr" && (sortAsc ? "↑" : "↓")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.flatMap((c, idx) => {
              const isExpanded = expandedId === c.campaign_id;
              const rows = [
                <tr
                  key={c.campaign_id}
                  className={`cursor-pointer border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] ${idx % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                  onClick={() => setExpandedId(isExpanded ? null : c.campaign_id)}
                  data-testid={`row-campaign-${c.campaign_id}`}
                >
                  <td className={`${tdClass} font-medium text-foreground`}>
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="truncate max-w-[200px]">{c.campaign_name}</span>
                    </div>
                  </td>
                  <td className={`${tdClass} text-[#10E29C]`}>{fmtCurrency(c.spend)}</td>
                  <td className={tdClass}>{fmtNumber(c.leads)}</td>
                  <td className={tdClass}>{fmtCurrency(c.cpl)}</td>
                  <td className={tdClass}>{fmtNumber(c.impressions)}</td>
                  <td className={tdClass}>{fmtNumber(c.clicks)}</td>
                  <td className={tdClass}>{c.ctr.toFixed(2)}%</td>
                </tr>,
              ];
              if (isExpanded && c.adsets) {
                for (const a of c.adsets) {
                  rows.push(
                    <tr key={`${c.campaign_id}-${a.adset_id}`} className="border-b border-white/[0.03] bg-white/[0.02]">
                      <td className={`${tdClass} pl-10 text-muted-foreground`}>
                        <span className="truncate max-w-[180px] inline-block">{a.adset_name}</span>
                      </td>
                      <td className={tdClass}>{fmtCurrency(a.spend)}</td>
                      <td className={tdClass}>{fmtNumber(a.leads)}</td>
                      <td className={tdClass}>{fmtCurrency(a.cpl)}</td>
                      <td className={tdClass}>{fmtNumber(a.impressions)}</td>
                      <td className={tdClass}>{fmtNumber(a.clicks)}</td>
                      <td className={tdClass}>{a.ctr.toFixed(2)}%</td>
                    </tr>
                  );
                }
              }
              return rows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
