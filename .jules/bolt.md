## 2023-11-20 - [N+1 Optimization]
**Learning:** Avoid Prisma's `aggregate` or `findMany` queries wrapped in loops (like `Promise.all` over `.map`). Also, `groupBy` doesn't support complex relation filtering, so fetching required data with a single batched `findMany` and using `reduce` in-memory is an effective pattern.
**Action:** Always batch database fetching instead of sequentially firing off individual queries in a loop, then aggregate data in memory as necessary.
