## 2025-01-01 - Optimizing N+1 Database Queries using Chunking
**Learning:** When optimizing sequential N+1 database calls using `Promise.all`, unbounded mapping over large arrays (like `Promise.all(farmers.map(...))`) can exhaust the Prisma database connection pool because it executes all queries concurrently.
**Action:** Always batch or chunk `Promise.all` requests (e.g., in chunks of 10-20) when mapping over large arrays that execute DB operations to balance performance and connection limits.
