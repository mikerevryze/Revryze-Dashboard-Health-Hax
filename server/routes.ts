import type { Express } from "express";
import { type Server } from "http";
import { executeQuery } from "./snowflake";
import { log } from "./logger";

function isValidDate(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime());
}

function buildDateFilter(query: Record<string, any>, dateColumn: string, prefix: "WHERE" | "AND"): string {
  const startDate = query.start_date as string | undefined;
  const endDate = query.end_date as string | undefined;
  if (startDate && endDate && isValidDate(startDate) && isValidDate(endDate)) {
    return `${prefix} ${dateColumn} >= '${startDate}'::DATE AND ${dateColumn} <= '${endDate}'::DATE`;
  }
  const days = parseInt(query.days as string);
  if (!isNaN(days) && days > 0 && days <= 3650) {
    return `${prefix} ${dateColumn} >= DATEADD('day', -${days}, CURRENT_DATE())`;
  }
  return "";
}

const META_DEDUP_CTE = `
  WITH meta_deduped AS (
    SELECT DATE_START, CAMPAIGN_ID, CAMPAIGN_NAME, ADSET_ID, ADSET_NAME, AD_ID, AD_NAME,
      MAX(IMPRESSIONS) AS IMPRESSIONS, MAX(CLICKS) AS CLICKS, MAX(SPEND) AS SPEND, MAX(LEADS) AS LEADS
    FROM REVRYZE.RAW.META_ADS_DAILY
    GROUP BY DATE_START, CAMPAIGN_ID, CAMPAIGN_NAME, ADSET_ID, ADSET_NAME, AD_ID, AD_NAME
  )
`;

function metaDateFilter(query: Record<string, any>, prefix: "WHERE" | "AND"): string {
  return buildDateFilter(query, "DATE_START", prefix);
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.get("/api/metrics", async (req, res) => {
    try {
      const dateFilter = buildDateFilter(req.query, "CREATED_AT_TS", "WHERE");
      const rows = await executeQuery<{ TOTAL_LEADS: number; CLOSED_WON: number; LOST_DEALS: number; OPEN_DEALS: number; TOTAL_VALUE: number; }>(`
        SELECT COUNT(*) AS TOTAL_LEADS,
          SUM(CASE WHEN PIPELINE_STAGE_NAME ILIKE '%Closed-Won%' OR PIPELINE_STAGE_NAME ILIKE '%Closed Won%' OR STATUS = 'won' THEN 1 ELSE 0 END) AS CLOSED_WON,
          SUM(CASE WHEN PIPELINE_STAGE_NAME ILIKE '%Closed-Lost%' OR PIPELINE_STAGE_NAME ILIKE '%Closed Lost%' OR STATUS = 'lost' THEN 1 ELSE 0 END) AS LOST_DEALS,
          SUM(CASE WHEN STATUS = 'open' AND PIPELINE_STAGE_NAME NOT ILIKE '%Closed%' THEN 1 ELSE 0 END) AS OPEN_DEALS,
          COALESCE(SUM(MONETARY_VALUE), 0) AS TOTAL_VALUE
        FROM REVRYZE.RAW.GHL_OPPORTUNITIES ${dateFilter}
      `);
      const row = rows[0];
      const totalLeads = Number(row?.TOTAL_LEADS) || 0;
      const closedWon = Number(row?.CLOSED_WON) || 0;
      const conversionRate = totalLeads > 0 ? closedWon / totalLeads : 0;
      res.json({
        total_leads: totalLeads,
        closed_won: closedWon,
        lost_deals: Number(row?.LOST_DEALS) || 0,
        open_deals: Number(row?.OPEN_DEALS) || 0,
        total_value: Number(row?.TOTAL_VALUE) || 0,
        conversion_rate: conversionRate,
      });
    } catch (err: any) {
      log(`Metrics endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch metrics from Snowflake" });
    }
  });

  app.get("/api/meta", async (req, res) => {
    try {
      const dateFilter = metaDateFilter(req.query, "WHERE");
      const rows = await executeQuery<{ TOTAL_SPEND: number; TOTAL_LEADS: number; }>(`
        ${META_DEDUP_CTE}
        SELECT COALESCE(SUM(SPEND), 0) AS TOTAL_SPEND, COALESCE(SUM(LEADS), 0) AS TOTAL_LEADS
        FROM meta_deduped ${dateFilter}
      `);
      const row = rows[0];
      const totalSpend = Number(row?.TOTAL_SPEND) || 0;
      const totalLeads = Number(row?.TOTAL_LEADS) || 0;
      res.json({ total_spend: totalSpend, total_leads: totalLeads, cpl: totalLeads > 0 ? totalSpend / totalLeads : 0 });
    } catch (err: any) {
      log(`Meta endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch Meta ads data" });
    }
  });

  app.get("/api/meta/daily", async (req, res) => {
    try {
      const dateFilter = metaDateFilter(req.query, "WHERE");
      const rows = await executeQuery<{
        DATE_START: string;
        DAILY_SPEND: number;
        DAILY_LEADS: number;
        DAILY_IMPRESSIONS: number;
        DAILY_CLICKS: number;
      }>(`
        ${META_DEDUP_CTE}
        SELECT DATE_START,
          COALESCE(SUM(SPEND), 0) AS DAILY_SPEND,
          COALESCE(SUM(LEADS), 0) AS DAILY_LEADS,
          COALESCE(SUM(IMPRESSIONS), 0) AS DAILY_IMPRESSIONS,
          COALESCE(SUM(CLICKS), 0) AS DAILY_CLICKS
        FROM meta_deduped ${dateFilter}
        GROUP BY DATE_START
        ORDER BY DATE_START ASC
      `);
      res.json(rows.map((r) => {
        const spend = Number(r.DAILY_SPEND) || 0;
        const leads = Number(r.DAILY_LEADS) || 0;
        return {
          date: r.DATE_START instanceof Date ? r.DATE_START.toISOString().split("T")[0] : String(r.DATE_START).substring(0, 10),
          spend,
          leads,
          impressions: Number(r.DAILY_IMPRESSIONS) || 0,
          clicks: Number(r.DAILY_CLICKS) || 0,
          cpl: leads > 0 ? spend / leads : 0,
        };
      }));
    } catch (err: any) {
      log(`Meta daily endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch daily Meta data" });
    }
  });

  app.get("/api/meta/campaigns", async (req, res) => {
    try {
      const dateFilter = metaDateFilter(req.query, "WHERE");
      const rows = await executeQuery<{
        CAMPAIGN_ID: string;
        CAMPAIGN_NAME: string;
        TOTAL_SPEND: number;
        TOTAL_LEADS: number;
        TOTAL_IMPRESSIONS: number;
        TOTAL_CLICKS: number;
        ADSET_ID: string;
        ADSET_NAME: string;
        ADSET_SPEND: number;
        ADSET_LEADS: number;
        ADSET_IMPRESSIONS: number;
        ADSET_CLICKS: number;
      }>(`
        ${META_DEDUP_CTE},
        campaign_totals AS (
          SELECT CAMPAIGN_ID, CAMPAIGN_NAME,
            COALESCE(SUM(SPEND), 0) AS TOTAL_SPEND,
            COALESCE(SUM(LEADS), 0) AS TOTAL_LEADS,
            COALESCE(SUM(IMPRESSIONS), 0) AS TOTAL_IMPRESSIONS,
            COALESCE(SUM(CLICKS), 0) AS TOTAL_CLICKS
          FROM meta_deduped ${dateFilter}
          GROUP BY CAMPAIGN_ID, CAMPAIGN_NAME
        ),
        adset_totals AS (
          SELECT CAMPAIGN_ID, ADSET_ID, ADSET_NAME,
            COALESCE(SUM(SPEND), 0) AS ADSET_SPEND,
            COALESCE(SUM(LEADS), 0) AS ADSET_LEADS,
            COALESCE(SUM(IMPRESSIONS), 0) AS ADSET_IMPRESSIONS,
            COALESCE(SUM(CLICKS), 0) AS ADSET_CLICKS
          FROM meta_deduped ${dateFilter}
          GROUP BY CAMPAIGN_ID, ADSET_ID, ADSET_NAME
        )
        SELECT c.CAMPAIGN_ID, c.CAMPAIGN_NAME, c.TOTAL_SPEND, c.TOTAL_LEADS,
          c.TOTAL_IMPRESSIONS, c.TOTAL_CLICKS,
          a.ADSET_ID, a.ADSET_NAME, a.ADSET_SPEND, a.ADSET_LEADS,
          a.ADSET_IMPRESSIONS, a.ADSET_CLICKS
        FROM campaign_totals c
        LEFT JOIN adset_totals a ON c.CAMPAIGN_ID = a.CAMPAIGN_ID
        ORDER BY c.TOTAL_SPEND DESC, a.ADSET_SPEND DESC
      `);

      const campaignMap = new Map<string, any>();
      for (const r of rows) {
        const cid = String(r.CAMPAIGN_ID || "unknown");
        if (!campaignMap.has(cid)) {
          const spend = Number(r.TOTAL_SPEND) || 0;
          const leads = Number(r.TOTAL_LEADS) || 0;
          const impressions = Number(r.TOTAL_IMPRESSIONS) || 0;
          const clicks = Number(r.TOTAL_CLICKS) || 0;
          campaignMap.set(cid, {
            campaign_id: cid,
            campaign_name: String(r.CAMPAIGN_NAME || "Unknown"),
            spend,
            leads,
            cpl: leads > 0 ? spend / leads : 0,
            impressions,
            clicks,
            ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
            adsets: [],
          });
        }
        if (r.ADSET_ID) {
          const campaign = campaignMap.get(cid);
          const adsetExists = campaign.adsets.some((a: any) => a.adset_id === String(r.ADSET_ID));
          if (!adsetExists) {
            const aSpend = Number(r.ADSET_SPEND) || 0;
            const aLeads = Number(r.ADSET_LEADS) || 0;
            const aImpressions = Number(r.ADSET_IMPRESSIONS) || 0;
            const aClicks = Number(r.ADSET_CLICKS) || 0;
            campaign.adsets.push({
              adset_id: String(r.ADSET_ID),
              adset_name: String(r.ADSET_NAME || "Unknown"),
              spend: aSpend,
              leads: aLeads,
              cpl: aLeads > 0 ? aSpend / aLeads : 0,
              impressions: aImpressions,
              clicks: aClicks,
              ctr: aImpressions > 0 ? (aClicks / aImpressions) * 100 : 0,
            });
          }
        }
      }
      res.json(Array.from(campaignMap.values()));
    } catch (err: any) {
      log(`Campaign endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch campaign data" });
    }
  });

  app.get("/api/leads-breakdown", async (req, res) => {
    try {
      const dateFilter = metaDateFilter(req.query, "WHERE");
      const metaRows = await executeQuery<{ TOTAL_LEADS: number }>(`
        ${META_DEDUP_CTE}
        SELECT COALESCE(SUM(LEADS), 0) AS TOTAL_LEADS
        FROM meta_deduped ${dateFilter}
      `);
      const metaLeads = Number(metaRows[0]?.TOTAL_LEADS) || 0;

      const ghlFilter = buildDateFilter(req.query, "CREATED_AT_TS", "WHERE");
      const ghlRows = await executeQuery<{ TOTAL_LEADS: number }>(`
        SELECT COUNT(*) AS TOTAL_LEADS
        FROM REVRYZE.RAW.GHL_OPPORTUNITIES ${ghlFilter}
      `);
      const totalLeads = Number(ghlRows[0]?.TOTAL_LEADS) || 0;
      const organicLeads = Math.max(0, totalLeads - metaLeads);

      res.json({ total_leads: totalLeads, meta_leads: metaLeads, organic_leads: organicLeads });
    } catch (err: any) {
      log(`Leads breakdown endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch leads breakdown" });
    }
  });

  app.get("/api/daily-metrics", async (req, res) => {
    try {
      const dateFilter = metaDateFilter(req.query, "WHERE");
      const metaRows = await executeQuery<{
        DATE_START: string;
        DAILY_SPEND: number;
        DAILY_LEADS: number;
      }>(`
        ${META_DEDUP_CTE}
        SELECT DATE_START,
          COALESCE(SUM(SPEND), 0) AS DAILY_SPEND,
          COALESCE(SUM(LEADS), 0) AS DAILY_LEADS
        FROM meta_deduped ${dateFilter}
        GROUP BY DATE_START
        ORDER BY DATE_START ASC
      `);

      const ghlFilter = buildDateFilter(req.query, "CREATED_AT_TS", "WHERE");
      const ghlRows = await executeQuery<{
        OPP_DATE: string;
        DAILY_LEADS: number;
        DAILY_WON: number;
      }>(`
        SELECT DATE_TRUNC('day', CREATED_AT_TS)::DATE AS OPP_DATE,
          COUNT(*) AS DAILY_LEADS,
          SUM(CASE WHEN PIPELINE_STAGE_NAME ILIKE '%Closed-Won%' OR PIPELINE_STAGE_NAME ILIKE '%Closed Won%' OR STATUS = 'won' THEN 1 ELSE 0 END) AS DAILY_WON
        FROM REVRYZE.RAW.GHL_OPPORTUNITIES ${ghlFilter}
        GROUP BY OPP_DATE
        ORDER BY OPP_DATE ASC
      `);

      const ghlMap = new Map<string, { leads: number; won: number }>();
      for (const r of ghlRows) {
        const d = r.OPP_DATE instanceof Date ? r.OPP_DATE.toISOString().split("T")[0] : String(r.OPP_DATE).substring(0, 10);
        ghlMap.set(d, { leads: Number(r.DAILY_LEADS) || 0, won: Number(r.DAILY_WON) || 0 });
      }

      const allDates = new Set<string>();
      for (const r of metaRows) {
        const d = r.DATE_START instanceof Date ? r.DATE_START.toISOString().split("T")[0] : String(r.DATE_START).substring(0, 10);
        allDates.add(d);
      }
      for (const d of ghlMap.keys()) allDates.add(d);

      const result = Array.from(allDates).sort().map(date => {
        const meta = metaRows.find(r => {
          const d = r.DATE_START instanceof Date ? r.DATE_START.toISOString().split("T")[0] : String(r.DATE_START).substring(0, 10);
          return d === date;
        });
        const spend = Number(meta?.DAILY_SPEND) || 0;
        const metaLeads = Number(meta?.DAILY_LEADS) || 0;
        const ghl = ghlMap.get(date);
        const totalLeads = ghl?.leads || 0;
        const closedWon = ghl?.won || 0;
        const organicLeads = Math.max(0, totalLeads - metaLeads);
        return {
          date,
          leads: totalLeads,
          closed_won: closedWon,
          spend,
          meta_leads: metaLeads,
          organic_leads: organicLeads,
          cpl: metaLeads > 0 ? spend / metaLeads : 0,
        };
      });

      res.json(result);
    } catch (err: any) {
      log(`Daily metrics endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch daily metrics" });
    }
  });

  app.get("/api/funnel", async (req, res) => {
    try {
      const dateFilter = buildDateFilter(req.query, "CREATED_AT_TS", "AND");
      const rows = await executeQuery<{ PIPELINE_NAME: string; PIPELINE_STAGE_NAME: string; OPP_COUNT: number; TOTAL_VALUE: number; }>(`
        SELECT PIPELINE_NAME, PIPELINE_STAGE_NAME, COUNT(*) AS OPP_COUNT, COALESCE(SUM(MONETARY_VALUE),0) AS TOTAL_VALUE
        FROM REVRYZE.RAW.GHL_OPPORTUNITIES
        WHERE STATUS != 'lost' AND PIPELINE_STAGE_NAME NOT ILIKE '%Closed-Lost%' AND PIPELINE_STAGE_NAME NOT ILIKE '%Closed Lost%' ${dateFilter}
        GROUP BY PIPELINE_NAME, PIPELINE_STAGE_NAME ORDER BY PIPELINE_NAME, OPP_COUNT DESC
      `);
      res.json(rows.map((r) => ({ pipeline_name: r.PIPELINE_NAME || "Unknown", stage_name: r.PIPELINE_STAGE_NAME || "Unknown", count: Number(r.OPP_COUNT) || 0, total_value: Number(r.TOTAL_VALUE) || 0 })));
    } catch (err: any) {
      log(`Funnel endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch funnel data" });
    }
  });

  app.get("/api/debug/meta-levels", async (req, res) => {
    try {
      const rows = await executeQuery<any>(`
        SELECT LEVEL, COUNT(*) AS ROW_COUNT, SUM(LEADS) AS TOTAL_LEADS, SUM(SPEND) AS TOTAL_SPEND
        FROM REVRYZE.RAW.META_ADS_DAILY
        GROUP BY LEVEL
      `);
      const rowCount = await executeQuery<any>(`
        SELECT COUNT(*) AS TOTAL FROM REVRYZE.RAW.META_ADS_DAILY
      `);
      const adLevel = await executeQuery<any>(`
        SELECT SUM(LEADS) AS TOTAL_LEADS, SUM(SPEND) AS TOTAL_SPEND
        FROM (
          SELECT DATE_START, AD_ID, MAX(LEADS) AS LEADS, MAX(SPEND) AS SPEND
          FROM REVRYZE.RAW.META_ADS_DAILY
          WHERE LEVEL = 'ad'
          GROUP BY DATE_START, AD_ID
        )
      `);
      res.json({ levels: rows, total_rows: rowCount[0], ad_only_deduped: adLevel[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  return httpServer;
}
