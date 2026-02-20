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
        TOTAL_DEALS: number;
        WON_DEALS: number;
        LOST_DEALS: number;
        OPEN_DEALS: number;
        TOTAL_VALUE: number;
      }>(`
        SELECT
          COUNT(*)                                           AS TOTAL_DEALS,
          SUM(CASE WHEN STATUS = 'won' THEN 1 ELSE 0 END)   AS WON_DEALS,
          SUM(CASE WHEN STATUS = 'lost' THEN 1 ELSE 0 END)  AS LOST_DEALS,
          SUM(CASE WHEN STATUS = 'open' THEN 1 ELSE 0 END)  AS OPEN_DEALS,
          COALESCE(SUM(MONETARY_VALUE), 0)                   AS TOTAL_VALUE
        FROM REVRYZE.RAW.GHL_OPPORTUNITIES
      `);

      const row = rows[0];
      res.json({
        total_deals: Number(row?.TOTAL_DEALS) || 0,
        won_deals: Number(row?.WON_DEALS) || 0,
        lost_deals: Number(row?.LOST_DEALS) || 0,
        open_deals: Number(row?.OPEN_DEALS) || 0,
        total_value: Number(row?.TOTAL_VALUE) || 0,
      });
    } catch (err: any) {
      log(`Metrics endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch metrics from Snowflake" });
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

  app.get("/api/recent", async (_req, res) => {
    try {
      const rows = await executeQuery<{
        NAME: string;
        PIPELINE_STAGE_NAME: string;
        STATUS: string;
        MONETARY_VALUE: number;
        UPDATED_AT_TS: string | null;
      }>(`
        SELECT NAME, PIPELINE_STAGE_NAME, STATUS, MONETARY_VALUE, UPDATED_AT_TS
        FROM REVRYZE.RAW.GHL_OPPORTUNITIES
        ORDER BY UPDATED_AT_TS DESC
        LIMIT 10
      `);

      res.json(
        rows.map((r) => ({
          name: r.NAME || "Unnamed",
          stage_name: r.PIPELINE_STAGE_NAME || "Unknown",
          status: r.STATUS || "unknown",
          value: Number(r.MONETARY_VALUE) || 0,
          updated_at: r.UPDATED_AT_TS ?? null,
        }))
      );
    } catch (err: any) {
      log(`Recent deals endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch recent deals" });
    }
  });

  return httpServer;
}
