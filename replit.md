# Revryze Dashboard

## Overview
A full-stack performance dashboard for Revryze that connects to Snowflake to display GHL pipeline stats including deal metrics, pipeline funnel visualization, and recent deal activity.

## Architecture
- **Frontend**: React + Vite with Tailwind CSS, dark-themed (#000000 background, #10E29C primary green)
- **Backend**: Express.js server with Snowflake SDK connection
- **Data Source**: Snowflake (table: `REVRYZE.RAW.GHL_OPPORTUNITIES`)

## Key Files
- `client/src/App.tsx` - Main app with header/branding
- `client/src/pages/dashboard.tsx` - Dashboard page with metrics grid, funnel chart, and recent deals
- `client/src/components/MetricCard.tsx` - Reusable metric card component
- `client/src/components/FunnelChart.tsx` - Pipeline funnel bar chart
- `client/src/components/RecentDeals.tsx` - Recent deals activity table
- `server/routes.ts` - API routes (GET /api/metrics, /api/funnel, /api/recent)
- `server/snowflake.ts` - Snowflake connection and query executor
- `server/logger.ts` - Shared logging utility
- `shared/schema.ts` - Shared TypeScript types (Metrics, FunnelStage, RecentDeal, DashboardData)

## API Endpoints
- `GET /api/metrics` - Returns { total_deals, open_deals, won_deals, lost_deals, total_value }
- `GET /api/funnel` - Returns array of { pipeline_name, stage_name, count, total_value } (excludes lost)
- `GET /api/recent` - Returns last 10 updated deals with name, stage, status, value, updated_at

## Environment Variables (Secrets)
- SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA

## Recent Changes
- 2026-02-21: Replaced old metrics/goal calculator with GHL_OPPORTUNITIES pipeline dashboard (funnel chart, recent deals table, updated metric cards)
- 2026-02-21: Fixed Snowflake warehouse activation with explicit USE WAREHOUSE after connect
- 2026-02-21: Used fully qualified table name REVRYZE.RAW.GHL_OPPORTUNITIES for queries
- 2026-02-19: Initial build - Revryze dashboard with Snowflake integration
