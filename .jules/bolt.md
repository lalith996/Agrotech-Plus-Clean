## 2024-05-18 - Fix N+1 Query in Farmer Performance API
**Learning:** The Next.js API routes may contain N+1 query patterns when fetching nested relations sequentially, negatively impacting backend performance.
**Action:** Use batching (e.g., fetching by multiple IDs with 'in' queries) to process relations in memory instead of sequential queries within loops.
