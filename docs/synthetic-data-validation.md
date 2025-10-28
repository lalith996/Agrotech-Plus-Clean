# Synthetic Data Validation Plan

This document captures expected volumes, distributions, and thresholds used to validate the synthetic dataset supporting AI/ML features (forecasting, pricing, recommendations, churn, NLP).

## Entities and Target Volumes
- Customers: baseline 100; accept >= 90% of configured `--customers`
- Farmers: baseline 12; accept >= 90% of configured `--farmers`
- Products: >= 3 per farmer (target 3–6 per farmer)
- Subscriptions: >= 50% of customers
- QC Results: >= 8 per farmer across period
- Orders: target ≥ 0.5 orders/customer/week (weighted by active subscriptions)
- Notifications: 1–5 per customer
- Search Queries: 2–10 per customer

## Time Window
- Weekly granularity; configurable `--weeks` (default 52). Weekly buckets start Monday.

## Metrics and Thresholds
- Order volume by week: no week should be zero if `orders/customer/week ≥ 0.5` and customers > 0
- QC acceptance rate by week: weighted acceptance `accepted / expected` per week. Flag weeks < 70%
- Price variance across categories: compute per-category variance and average; flag categories with `count < 10` (insufficient samples)

## Automated Checks
- Built into `scripts/generate-synthetic-data.js` (`--validate=true`)
- Standalone: `scripts/validate-synthetic-data.js` with CLI thresholds:
  - `--minCustomers`, `--minFarmers`, `--weeks`, `--minOrdersPerCustomerPerWeek`

## Safe Execution
- Do not run on production databases.
- Verify `DATABASE_URL` and `NODE_ENV` before execution.

## Manual Review
- Inspect admin analytics at `/admin/analytics`:
  - Order volume chart displays rising/falling trends, no large gaps
  - QC acceptance rates generally between 80–100% with occasional dips
  - Price variance chart identifies categories with high volatility

## Tuning Parameters
- Adjust generator CLI flags to control volumes (`--customers`, `--farmers`, `--weeks`, etc.)
- Modify demand seasonality and subscription ratios to simulate different regimes.