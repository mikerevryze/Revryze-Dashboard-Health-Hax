import type { Express } from "express";
import { type Server } from "http";
import { executeQuery } from "./snowflake";
import { log } from "./logger";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/metrics", async (_req, res) => {
    try {
      const rows = await executeQuery<{
        TOTAL_LEADS: number;
        CLOSED_WON: number;
        LOST_DEALS: number;
        OPEN_DEALS: number;
        TOTAL_VALUE: number;
      }>(`
        SELECT
          COUNT(*)  AS TOTAL_LEADS,
          SUM(CASE
            WHEN PIPELINE_STAGE_NAME ILIKE '%Closed-Won%'
              OR PIPELINE_STAGE_NAME ILIKE '%Closed Won%'
              OR STATUS = 'won'
            THEN 1 ELSE 0
          END) AS CLOSED_WON,
          SUM(CASE
            WHEN PIPELINE_STAGE_NAME ILIKE '%Closed-Lost%'
              OR PIPELINE_STAGE_NAME ILIKE '%Closed Lost%'
              OR STATUS = 'lost'
            THEN 1 ELSE 0
          END) AS LOST_DEALS,
          SUM(CASE
            WHEN STATUS = 'open'
              AND PIPELINE_STAGE_NAME NOT ILIKE '%Closed%'
            THEN 1 ELSE 0
          END) AS OPEN_DEALS,
          COALESCE(SUM(MONETARY_VALUE), 0) AS TOTAL_VALUE
        FROM REVRYZE.RAW.GHL_OPPORTUNITIES
      `);

      const row = rows[0];
      res.json({
        total_leads: Number(row?.TOTAL_LEADS) || 0,
        closed_won: Number(row?.CLOSED_WON) || 0,
        lost_deals: Number(row?.LOST_DEALS) || 0,
        open_deals: Number(row?.OPEN_DEALS) || 0,
        total_value: Number(row?.TOTAL_VALUE) || 0,
      });
    } catch (err: any) {
      log(`Metrics endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch metrics from Snowflake" });
    }
  });

  app.get("/api/meta", async (_req, res) => {
    try {
      const rows = await executeQuery<{
        TOTAL_SPEND: number;
        TOTAL_LEADS: number;
      }>(`
        SELECT
          COALESCE(SUM(SPEND), 0)  AS TOTAL_SPEND,
          COALESCE(SUM(LEADS), 0)  AS TOTAL_LEADS
        FROM REVRYZE.RAW.META_ADS_DAILY
      `);

      const row = rows[0];
      const totalSpend = Number(row?.TOTAL_SPEND) || 0;
      const totalLeads = Number(row?.TOTAL_LEADS) || 0;
      const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

      res.json({
        total_spend: totalSpend,
        total_leads: totalLeads,
        cpl,
      });
    } catch (err: any) {
      log(`Meta endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch Meta ads data" });
    }
  });

  app.get("/api/funnel", async (_req, res) => {
    try {
      const rows = await executeQuery<{
        PIPELINE_NAME: string;
        PIPELINE_STAGE_NAME: string;
        OPP_COUNT: number;
        TOTAL_VALUE: number;
      }>(`
        SELECT
          PIPELINE_NAME,
          PIPELINE_STAGE_NAME,
          COUNT(*)                        AS OPP_COUNT,
          COALESCE(SUM(MONETARY_VALUE),0) AS TOTAL_VALUE
        FROM REVRYZE.RAW.GHL_OPPORTUNITIES
        WHERE STATUS != 'lost'
          AND PIPELINE_STAGE_NAME NOT ILIKE '%Closed-Lost%'
          AND PIPELINE_STAGE_NAME NOT ILIKE '%Closed Lost%'
        GROUP BY PIPELINE_NAME, PIPELINE_STAGE_NAME
        ORDER BY PIPELINE_NAME, OPP_COUNT DESC
      `);

      res.json(
        rows.map((r) => ({
          pipeline_name: r.PIPELINE_NAME || "Unknown",
          stage_name: r.PIPELINE_STAGE_NAME || "Unknown",
          count: Number(r.OPP_COUNT) || 0,
          total_value: Number(r.TOTAL_VALUE) || 0,
        }))
      );
    } catch (err: any) {
      log(`Funnel endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch funnel data" });
    }
  });

  return httpServer;
}
