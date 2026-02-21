# Revryze Dashboard

## Overview
A full-stack performance dashboard for Revryze that connects to Snowflake to display GHL pipeline stats and Meta Ads metrics, with a goal calculator to estimate required ad spend for membership targets.

## Architecture
- **Frontend**: React + Vite with Tailwind CSS, dark-themed (#000000 background, #10E29C primary green)
- **Backend**: Express.js server with Snowflake SDK connection
- **Data Source**: Snowflake (tables: `REVRYZE.RAW.GHL_OPPORTUNITIES`, `REVRYZE.RAW.META_ADS_DAILY`)

## Key Files
- `client/src/App.tsx` - Main app with header/branding
- `client/src/pages/dashboard.tsx` - Dashboard page with metrics grid, funnel chart, and goal calculator
- `client/src/components/MetricCard.tsx` - Reusable metric card component
- `client/src/components/FunnelChart.tsx` - Pipeline funnel bar chart
- `client/src/components/GoalCalculator.tsx` - Goal calculator with popips/organic lead offset
- `client/src/components/DateRangePicker.tsx` - Date range picker with presets (30d/60d/90d/120d/All) and custom calendar
- `server/routes.ts` - API routes (GET /api/metrics, /api/meta, /api/funnel) with date filtering
- `server/snowflake.ts` - Snowflake connection and query executor (with USE WAREHOUSE fix)
- `server/logger.ts` - Shared logging utility
- `shared/schema.ts` - Shared TypeScript types (Metrics, MetaMetrics, FunnelStage)

## API Endpoints
- `GET /api/metrics` - Returns { total_leads, closed_won, open_deals, lost_deals, total_value } from GHL_OPPORTUNITIES
- `GET /api/meta` - Returns { total_spend, total_leads, cpl } from META_ADS_DAILY
- `GET /api/funnel` - Returns array of { pipeline_name, stage_name, count, total_value } (excludes lost/closed-lost)
- All endpoints support `?days=N` or `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` for date filtering

## Environment Variables (Secrets)
- SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA

## Recent Changes
- 2026-02-22: Added DateRangePicker with preset buttons (30d/60d/90d/120d/All) and custom calendar range picker
- 2026-02-22: Added date filtering to all API endpoints via ?days=N or ?start_date/end_date query params
- 2026-02-21: Added Meta Ads endpoint (/api/meta) pulling from META_ADS_DAILY table
- 2026-02-21: Updated metrics to use PIPELINE_STAGE_NAME for closed-won/lost detection via ILIKE
- 2026-02-21: Rebuilt GoalCalculator with popips (organic leads) offset and Meta CPL integration
- 2026-02-21: Updated funnel to exclude Closed-Lost stages
- 2026-02-21: Fixed Snowflake warehouse activation with explicit USE WAREHOUSE after connect
- 2026-02-21: Used fully qualified table names (REVRYZE.RAW.*) for all queries
- 2026-02-19: Initial build - Revryze dashboard with Snowflake integration
