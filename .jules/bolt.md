## 2024-06-05 - N+1 Query Problem in Order Creation
**Learning:** The codebase contains an anti-pattern in API routes where array inputs (e.g., order items) are validated using individual `prisma.product.findUnique` queries inside loops, causing N+1 query bottlenecks.
**Action:** Pre-fetch related records using Prisma's `in` operator and an in-memory Map to avoid N+1 query bottlenecks.
