## 2024-05-27 - Stale Closures with Form Submissions in React
**Learning:** When handling manual form submissions alongside state updates (like debounced searches), calling fetch functions immediately after a state setter (e.g., `setDebouncedSearchTerm(searchTerm); fetchProducts();`) executes the fetch with a stale state closure due to React's asynchronous state batching.
**Action:** Rely on the `useEffect` dependent on the state variable to trigger the fetch, or only update the local state in the form handler and let the existing effects handle the data fetching naturally.
