
## 2024-11-08 - Prisma Include Overfetch Memory Bloat
**Learning:** When calculating aggregates manually in Node.js (like repeat purchase rates) using Prisma, deeply nested `include` blocks pull massive data trees into memory, drastically reducing speed. Replacing these with focused `select` clauses (e.g. just `customerId: true`) avoids downloading unused relations.
**Action:** Always prefer `select` over `include` when extracting a single scalar identifier for grouping or counting in code.
