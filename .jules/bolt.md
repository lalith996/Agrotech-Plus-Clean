## 2025-02-23 - Search API Debouncing
**Learning:** React component re-renders trigger expensive API calls in `pages/products/index.tsx` for every keystroke because the dependency array tracks the raw `searchTerm` instead of a debounced version.
**Action:** Debounce high-frequency inputs locally with `setTimeout` or a custom hook before relying on them to trigger backend fetches.
