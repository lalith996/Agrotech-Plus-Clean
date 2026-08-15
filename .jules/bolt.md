## 2024-07-10 - O(1) Pagination Over O(N) Array Slicing
**Learning:** Returning all objects from the database and doing in-memory pagination via array slicing (`filteredProducts.slice(skip, skip + limitNum)`) can cause significant memory pressure and latency bottlenecks as tables grow.
**Action:** Default to database-level pagination using Prisma's `skip` and `take` via `prisma.$transaction`. Reserve in-memory slicing only as a fallback for dynamic attributes that can't be pushed into database queries (e.g. calculated properties without stored values).
