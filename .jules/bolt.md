## 2024-11-20 - N+1 Query in Order Creation
**Learning:** Found an N+1 query issue in API routes where array inputs (order items) were validated using individual `prisma.product.findUnique` queries inside a loop.
**Action:** Always pre-fetch related records using Prisma's `in` operator and an in-memory Map to avoid N+1 query bottlenecks.
