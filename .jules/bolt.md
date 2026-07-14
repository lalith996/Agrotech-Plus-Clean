## 2024-05-18 - Avoid fetching all rows before paginating in Prisma
**Learning:** In `pages/api/products/index.ts`, the code was fetching ALL products from the database (`prisma.product.findMany`) and then slicing the array in memory to apply pagination (`filteredProducts.slice(skip, skip + limitNum)`). This is a severe performance bottleneck (N+1 memory/processing) for a large database.
**Action:** Always apply `skip` and `take` directly within the Prisma query options when possible, instead of fetching everything and paginating in Node.js. Delegate pagination to the database.
