## 2026-07-25 - N+1 Query Anti-Pattern in API Routes
**Learning:** The codebase has a pattern of validating array inputs (like order items) using individual Prisma queries inside loops, causing N+1 query bottlenecks.
**Action:** Pre-fetch related records using Prisma's `in` operator and an in-memory Map before looping to avoid multiple database calls.