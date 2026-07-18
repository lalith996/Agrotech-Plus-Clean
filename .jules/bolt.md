## 2024-05-24 - N+1 Query Anti-Pattern in Loops
**Learning:** The codebase has a specific pattern where array inputs (like order items) are validated using individual `prisma.findUnique` queries inside loops, causing N+1 query bottlenecks.
**Action:** Always pre-fetch related records using Prisma's `in` operator (e.g., `findMany`) and store them in an in-memory Map before the loop to eliminate the N+1 bottleneck.
