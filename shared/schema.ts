import { z } from "zod";

export const metricsSchema = z.object({
  total_leads: z.number(),
  closed_won: z.number(),
  open_deals: z.number(),
  lost_deals: z.number(),
  total_value: z.number(),
  conversion_rate: z.number(),
});

export type Metrics = z.infer<typeof metricsSchema>;

export const metaSchema = z.object({
  total_spend: z.number(),
  total_leads: z.number(),
  cpl: z.number(),
});

export type MetaMetrics = z.infer<typeof metaSchema>;

export const metaDailySchema = z.object({
  date: z.string(),
  spend: z.number(),
  leads: z.number(),
  impressions: z.number(),
  clicks: z.number(),
  cpl: z.number(),
});

export type MetaDaily = z.infer<typeof metaDailySchema>;

export const campaignSchema = z.object({
  campaign_id: z.string(),
  campaign_name: z.string(),
  spend: z.number(),
  leads: z.number(),
  cpl: z.number(),
  impressions: z.number(),
  clicks: z.number(),
  ctr: z.number(),
  adsets: z.array(z.object({
    adset_id: z.string(),
    adset_name: z.string(),
    spend: z.number(),
    leads: z.number(),
    cpl: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    ctr: z.number(),
  })).optional(),
});

export type Campaign = z.infer<typeof campaignSchema>;

export const funnelStageSchema = z.object({
  pipeline_name: z.string(),
  stage_name: z.string(),
  count: z.number(),
  total_value: z.number(),
});

export type FunnelStage = z.infer<typeof funnelStageSchema>;

export const dailyMetricsSchema = z.object({
  date: z.string(),
  leads: z.number(),
  closed_won: z.number(),
  spend: z.number(),
  meta_leads: z.number(),
  organic_leads: z.number(),
  cpl: z.number(),
});

export type DailyMetrics = z.infer<typeof dailyMetricsSchema>;

export const leadsBreakdownSchema = z.object({
  total_leads: z.number(),
  meta_leads: z.number(),
  organic_leads: z.number(),
});

export type LeadsBreakdown = z.infer<typeof leadsBreakdownSchema>;
