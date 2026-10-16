## 2025-05-19 - N+1 Query in Demand Forecast
**Learning:** The farmer dashboard demand forecast was running an N+1 query (`prisma.orderItem.aggregate`) inside a `Promise.all` for each product.
**Action:** Replaced the N+1 `aggregate` query loop with a single `prisma.orderItem.groupBy` query to calculate demand for all products in one roundtrip.