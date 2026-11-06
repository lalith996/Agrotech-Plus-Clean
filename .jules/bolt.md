## 2024-05-15 - Prisma Memory Bloat Avoidance
**Learning:** Pulling full relation trees into node memory (e.g. `include` in `.findMany()`) just to calculate counts or metrics causes severe memory bloat and API latency (N+1 equivalent). Using `groupBy` with relational filters is also forbidden.
**Action:** Use Prisma's `.findMany()` with a strict `select` payload (e.g. `select: { customerId: true }`) to fetch only scalar IDs, and perform the count grouping in memory over the minimized payload.
