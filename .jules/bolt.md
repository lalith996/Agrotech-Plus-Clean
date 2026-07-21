## 2024-05-20 - N+1 Query Anti-Pattern in Array Input Validation
**Learning:** The codebase contains a specific anti-pattern in API routes (like order creation) where array inputs are validated using individual `prisma.product.findUnique` queries inside loops, causing significant N+1 query bottlenecks.
**Action:** Always pre-fetch related records for array inputs using Prisma's `in` operator and an in-memory Map before iterating.
