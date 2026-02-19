import { z } from "zod";

export const metricsSchema = z.object({
  closed_won_count: z.number(),
  closed_won_value: z.number(),
  total_spend: z.number(),
  total_leads: z.number(),
});

export type Metrics = z.infer<typeof metricsSchema>;
