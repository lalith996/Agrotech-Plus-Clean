## YYYY-MM-DD - Implement Debouncing for Product Search
**Learning:** Immediate state updates for search inputs in React trigger API calls on every keystroke, causing unnecessary re-renders and network congestion. Using a debounced state delays the API request until the user stops typing, significantly improving performance and reducing backend load.
**Action:** Always implement debouncing (using `useEffect` with `setTimeout` or a custom hook) for text-based filters that trigger backend queries or heavy computations.
