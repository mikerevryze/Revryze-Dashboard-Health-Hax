# Revryze Dashboard

## Overview
A full-stack performance dashboard for Revryze that connects to Snowflake to display sales and advertising metrics with a goal calculator.

## Architecture
- **Frontend**: React + Vite with Tailwind CSS, dark-themed (#000000 background, #10E29C primary green)
- **Backend**: Express.js server with Snowflake SDK connection
- **Data Source**: Snowflake (tables: `deals`, `ads`)

## Key Files
- `client/src/App.tsx` - Main app with header/branding
- `client/src/pages/dashboard.tsx` - Dashboard page with metrics grid and goal calculator
- `client/src/components/MetricCard.tsx` - Reusable metric card component
- `client/src/components/GoalCalculator.tsx` - Interactive goal calculator
- `server/routes.ts` - API routes (GET /api/metrics)
- `server/snowflake.ts` - Snowflake connection and query executor
- `shared/schema.ts` - Shared TypeScript types for metrics

## API Endpoints
- `GET /api/metrics` - Returns { closed_won_count, closed_won_value, total_spend, total_leads } from Snowflake

## Environment Variables
- SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD, SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA

## Recent Changes
- 2026-02-19: Initial build - Revryze dashboard with Snowflake integration, metric cards, goal calculator
