## 2024-05-18 - Fix N+1 queries in Order creation
**Learning:** Found N+1 queries pattern in `pages/api/orders/index.ts` during order creation, where `prisma.product.findUnique` is called in a loop for each order item to validate products and calculate `totalAmount`. This is a codebase-specific performance anti-pattern.
**Action:** Always pre-fetch related records outside loops using Prisma's `in` operator and an in-memory Map or Map-like structure to avoid N+1 query bottlenecks in API routes dealing with arrays of items.
