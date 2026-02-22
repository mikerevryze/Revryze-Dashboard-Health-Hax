# Revryze Dashboard

## Overview
A full-stack performance dashboard for Revryze that connects to Snowflake to display real-time GHL pipeline stats and Meta Ads metrics. Features glassmorphism dark-mode UI, interactive charts, expandable campaign tables, and a slide-out goal calculator for estimating required ad spend.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: Express.js server with Snowflake SDK connection
- **Data Source**: Snowflake (tables: `REVRYZE.RAW.GHL_OPPORTUNITIES`, `REVRYZE.RAW.META_ADS_DAILY`)
- **Theme**: Forced dark mode, #0A0A0F background, #10E29C teal primary, #6366F1 indigo secondary, glassmorphism cards

## Key Files
- `client/src/App.tsx` - Main app with header/branding and forced dark mode
- `client/src/pages/dashboard.tsx` - Dashboard page with KPI cards, charts, tables, goal calculator
- `client/src/components/KpiCard.tsx` - KPI card with sparklines, trend arrows, progress rings, color-coding
- `client/src/components/SpendLeadsChart.tsx` - Dual Y-axis area chart (spend + leads over time)
- `client/src/components/FunnelChart.tsx` - Animated pipeline funnel with conversion percentages
- `client/src/components/CampaignTable.tsx` - Sortable expandable campaign table with adset breakdown
- `client/src/components/CpmTrendChart.tsx` - Cost per member trend line chart with target reference line
- `client/src/components/GoalCalculator.tsx` - Slide-out panel with membership goal, organic leads, target CPM inputs
- `client/src/components/DateRangePicker.tsx` - Filter bar with 7D/30D/60D/90D/ALL presets and custom calendar
- `server/routes.ts` - API routes with date filtering and input validation
- `server/snowflake.ts` - Snowflake connection singleton with USE WAREHOUSE fix
- `server/logger.ts` - Shared logging utility
- `shared/schema.ts` - Shared TypeScript types (Metrics, MetaMetrics, MetaDaily, Campaign, FunnelStage)

## API Endpoints
- `GET /api/metrics` - Returns { total_leads, closed_won, open_deals, lost_deals, total_value, conversion_rate }
- `GET /api/meta` - Returns { total_spend, total_leads, cpl }
- `GET /api/meta/daily` - Returns daily breakdown [{ date, spend, leads, impressions, clicks, cpl }]
- `GET /api/meta/campaigns` - Returns campaign rollup with adsets [{ campaign_id, campaign_name, spend, leads, cpl, impressions, clicks, ctr, adsets }]
- `GET /api/funnel` - Returns pipeline funnel stages [{ pipeline_name, stage_name, count, total_value }]
- All endpoints support `?days=N` or `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` for date filtering
- Input validation: dates must match YYYY-MM-DD format, days must be 1-3650

## Environment Variables (Secrets)
- SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA

## Recent Changes
- 2026-02-22: Major dashboard upgrade - glassmorphism design, 4 KPI cards (sparklines, color-coded CPM, progress ring)
- 2026-02-22: Added Daily Spend & Leads area chart with dual Y-axis and animated Pipeline Funnel
- 2026-02-22: Added expandable Campaign Performance table with adset breakdown
- 2026-02-22: Added Cost Per Member trend line chart with target reference line
- 2026-02-22: Rebuilt Goal Calculator as slide-out panel with target CPM, budget gap indicator
- 2026-02-22: Added /api/meta/daily and /api/meta/campaigns endpoints
- 2026-02-22: Updated filter bar with 7D/30D/60D/90D/ALL presets, auto-refresh indicator
- 2026-02-22: Added input validation for date filtering parameters
- 2026-02-22: Forced dark mode, updated CSS theme (#0A0A0F bg, glassmorphism, indigo secondary)
- 2026-02-21: Initial dashboard with Snowflake integration, basic metrics, and funnel chart
