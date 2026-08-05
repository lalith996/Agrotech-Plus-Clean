## 2026-08-05 - Debounce Search Input
**Learning:** React state changes linked to inputs, when placed in the dependency array of a `useEffect` that makes an API call, can cause a flood of requests on every keystroke.
**Action:** Always implement a debounce mechanism (e.g., a `setTimeout` to update a separate debounced state variable) for inputs that trigger network requests to reduce unnecessary load and improve performance.
