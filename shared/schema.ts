import { z } from "zod";

export const metricsSchema = z.object({
  total_deals: z.number(),
  open_deals: z.number(),
  won_deals: z.number(),
  lost_deals: z.number(),
  total_value: z.number(),
});

export type Metrics = z.infer<typeof metricsSchema>;

export const funnelStageSchema = z.object({
  pipeline_name: z.string(),
  stage_name: z.string(),
  count: z.number(),
  total_value: z.number(),
});

export type FunnelStage = z.infer<typeof funnelStageSchema>;

export const recentDealSchema = z.object({
  name: z.string(),
  stage_name: z.string(),
  status: z.string(),
  value: z.number(),
  updated_at: z.string().nullable(),
});

export type RecentDeal = z.infer<typeof recentDealSchema>;

export const dashboardSchema = z.object({
  metrics: metricsSchema,
  funnel: z.array(funnelStageSchema),
  recent: z.array(recentDealSchema),
});

export type DashboardData = z.infer<typeof dashboardSchema>;
