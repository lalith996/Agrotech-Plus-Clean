## 2025-02-27 - N+1 Query in Demand Forecast
**Learning:** The demand forecast fallback calculation iterates over products and queries `orderItem` individually for each product. This leads to an N+1 query issue when generating forecasts for a farmer's products.
**Action:** Use Prisma's `groupBy` feature to perform a single query calculating aggregates for all products at once, then process the results in-memory.
