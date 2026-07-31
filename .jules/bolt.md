## 2025-02-12 - Prevent Excessive API Calls in Products Search
**Learning:** The products search page was missing debouncing on the search input, causing an API call on every keystroke. This is a common React performance bottleneck when combining `useEffect` with instant state updates.
**Action:** Always implement debouncing using a local state and `setTimeout` (or a dedicated hook/utility) for search inputs to reduce unnecessary API requests and re-renders.
