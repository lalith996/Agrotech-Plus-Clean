## 2024-07-24 - N+1 Query in Order Validation
**Learning:** Found an anti-pattern in API routes where array inputs (like order items) are validated using individual `prisma.product.findUnique` queries inside loops. This causes a severe N+1 query bottleneck which slows down order creation proportional to the number of items.
**Action:** Always pre-fetch related records using Prisma's `in` operator and an in-memory Map before iterating over the input array to avoid multiple database roundtrips.
