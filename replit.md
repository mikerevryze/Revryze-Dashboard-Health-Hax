# Revryze Dashboard

## Overview
A full-stack performance dashboard for Revryze that connects to Snowflake to display real-time GHL pipeline stats and Meta Ads metrics. Features dark-mode UI with glassmorphism cards, animated counters, interactive charts, donut visualizations, expandable campaign tables, and a slide-out goal calculator.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: Express.js server with Snowflake SDK connection
- **Data Source**: Snowflake (tables: `REVRYZE.RAW.GHL_OPPORTUNITIES`, `REVRYZE.RAW.META_ADS_DAILY`)
- **Theme**: Forced dark mode, #0A0A0F background, #10E29C green accent, dark cards, uppercase labels

## Key Files
- `client/src/App.tsx` - Main app with Revryze logo header and forced dark mode
- `client/src/pages/dashboard.tsx` - Dashboard page with all sections wired together
- `client/src/hooks/useCountUp.ts` - Animated counter hook (requestAnimationFrame, ease-out)
- `client/src/components/KpiCard.tsx` - KPI card with animated counters, sparklines, progress ring, color-coding
- `client/src/components/TrendsChart.tsx` - Full-width area chart with Spend/Leads/CPL toggle
- `client/src/components/DonutCharts.tsx` - Lead Source donut + Pipeline Stage donut with center labels
- `client/src/components/SpendLeadsChart.tsx` - Dual Y-axis area chart (spend + leads over time)
- `client/src/components/FunnelChart.tsx` - Animated pipeline funnel with conversion percentages
- `client/src/components/CampaignTable.tsx` - Sortable expandable campaign table with adset breakdown
- `client/src/components/CpmTrendChart.tsx` - Cost per member trend line chart with target reference line
- `client/src/components/GoalCalculator.tsx` - Slide-out panel with animated output values
- `client/src/components/DateRangePicker.tsx` - Filter bar with 30d/60d/90d/120d/All presets and custom calendar
- `server/routes.ts` - API routes with date filtering and input validation
- `server/snowflake.ts` - Snowflake connection singleton with USE WAREHOUSE fix
- `server/logger.ts` - Shared logging utility
- `shared/schema.ts` - Shared TypeScript types

## API Endpoints
- `GET /api/metrics` - Returns { total_leads, closed_won, open_deals, lost_deals, total_value, conversion_rate }
- `GET /api/meta` - Returns { total_spend, total_leads, cpl }
- `GET /api/meta/daily` - Returns daily breakdown [{ date, spend, leads, impressions, clicks, cpl }]
- `GET /api/meta/campaigns` - Returns campaign rollup with adsets
- `GET /api/funnel` - Returns pipeline funnel stages [{ pipeline_name, stage_name, count, total_value }]
- `GET /api/daily-metrics` - Returns daily time series [{ date, leads, closed_won, spend, meta_leads, organic_leads, cpl }]
- `GET /api/leads-breakdown` - Returns { total_leads, meta_leads, organic_leads }
- All endpoints support `?days=N` or `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` for date filtering
- Input validation: dates must match YYYY-MM-DD format, days must be 1-3650

## Logo Files
- `client/public/logos/revryze-icon.png` - Logomark (transparent PNG)
- `client/public/logos/revryze-wordmark.png` - Full wordmark (transparent PNG)

## Environment Variables (Secrets)
- SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA

## Data Architecture Notes
- **Lead counts** use GHL as source of truth (not Meta Ads), with `RAW:source::STRING = 'Facebook'` to classify paid vs organic
- **Spend/impressions/clicks** use Meta Ads table with deduplication CTE (GROUP BY business key to handle duplicate pulls)
- **Junk row filter**: GHL rows with `OPPORTUNITY_ID = 'undefined'` are excluded from all queries
- **CPL** = Meta spend / GHL Facebook-sourced leads (accurate cost per actual converted lead)

## Recent Changes
- 2026-02-22: Fixed lead counts — now uses GHL source attribution (RAW:source) instead of Meta's inflated lead events; added junk row filtering, Meta deduplication CTE
- 2026-02-22: Upgraded dashboard with animated counter numbers on all KPI cards and GoalCalculator outputs
- 2026-02-22: Added sparklines to all 4 KPI cards using /api/daily-metrics data
- 2026-02-22: Added Trends section with toggleable Spend/Leads/CPL area chart
- 2026-02-22: Added Lead Source donut (Paid vs Organic) and Pipeline Stage donut charts
- 2026-02-22: Added staggered card fade-in animations, pulse skeleton loading
- 2026-02-22: Updated header with Revryze logomark and wordmark from attached assets
- 2026-02-22: Updated DateRangePicker presets to 30d/60d/90d/120d/All
- 2026-02-22: Added /api/daily-metrics and /api/leads-breakdown endpoints
- 2026-02-22: Previous: glassmorphism design, charts, campaign table, funnel, goal calculator
- 2026-02-21: Initial dashboard with Snowflake integration
