## 2024-10-10 - Search Input Debouncing Optimization
**Learning:** React state changes from an input field typed rapidly were triggering an immediate API call for every single keystroke. This causes excessive backend load, race conditions from concurrent network requests resolving out-of-order, and UI lag.
**Action:** Implementing a standard 500ms debounce using `useEffect` locally in the component to batch rapid keystrokes into a single API request significantly improves both client and server performance for search-heavy interfaces.
