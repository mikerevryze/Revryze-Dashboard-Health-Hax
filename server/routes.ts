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
      const sql = `
        SELECT
          (SELECT COUNT(*) FROM deals WHERE stage = 'Closed Won') AS closed_won_count,
          (SELECT COALESCE(SUM(deal_value),0) FROM deals WHERE stage = 'Closed Won') AS closed_won_value,
          (SELECT COALESCE(SUM(spend),0) FROM ads) AS total_spend,
          (SELECT COALESCE(SUM(leads),0) FROM ads) AS total_leads
      `;

      const rows = await executeQuery<{
        CLOSED_WON_COUNT: number;
        CLOSED_WON_VALUE: number;
        TOTAL_SPEND: number;
        TOTAL_LEADS: number;
      }>(sql);

      if (!rows || rows.length === 0) {
        return res.json({
          closed_won_count: 0,
          closed_won_value: 0,
          total_spend: 0,
          total_leads: 0,
        });
      }

      const row = rows[0];
      res.json({
        closed_won_count: Number(row.CLOSED_WON_COUNT) || 0,
        closed_won_value: Number(row.CLOSED_WON_VALUE) || 0,
        total_spend: Number(row.TOTAL_SPEND) || 0,
        total_leads: Number(row.TOTAL_LEADS) || 0,
      });
    } catch (err: any) {
      log(`Metrics endpoint error: ${err.message}`, "api");
      res.status(500).json({ message: "Failed to fetch metrics from Snowflake" });
    }
  });

  return httpServer;
}
