## 2024-05-24 - Unnecessary API calls on every keystroke
**Learning:** React state updates triggering effects on every keystroke (`searchTerm`) leads to excessive API calls. While there is a debounced search component, standard inputs missing debouncing trigger full search requests on every character typed.
**Action:** Use `useEffect` with `setTimeout` to manage a local debounced state variable before triggering API requests, instead of importing debounce utilities.
