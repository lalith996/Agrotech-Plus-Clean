## 2025-02-17 - Debouncing API Calls in Client-side Rendering
**Learning:** Found a missing debounce implementation on a frequent event (search input) which triggered a `/api/products` fetch on every keystroke. This happens often when state like `searchTerm` is tied directly to a `useEffect` dependency array without a debounced proxy state.
**Action:** Always wrap high-frequency inputs in a `useDebounce` hook before using them as dependencies in `useEffect` for API calls to prevent backend overload and UI jitter.
