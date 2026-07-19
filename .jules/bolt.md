## 2024-05-24 - N+1 Query Anti-Pattern in Array Validations
**Learning:** The codebase contains a recurring anti-pattern where array inputs (like order items) are validated using individual `prisma.product.findUnique` queries inside a loop, causing N+1 query bottlenecks.
**Action:** Always pre-fetch related records using Prisma's `in` operator and map them in memory before iterating over array inputs to validate.
