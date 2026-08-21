## 2024-05-20 - Promise.all for database queries
**Learning:** Sequential Prisma queries in search suggestions block the event loop and increase latency.
**Action:** Use Promise.all to run independent Prisma queries concurrently for faster response times.
