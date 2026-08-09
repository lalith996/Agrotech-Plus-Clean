## 2024-05-20 - Un-debounced API Calls on Keystroke
**Learning:** Found that `searchTerm` in `pages/products/index.tsx` was directly in the `fetchProducts` dependency array, which triggers a network request to `/api/products` on every single keystroke.
**Action:** Always implement a debounce mechanism (e.g. using `useEffect` with `setTimeout`) for search inputs that trigger network requests to avoid frontend performance bottlenecks and backend rate-limiting/overload.
