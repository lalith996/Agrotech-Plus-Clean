## 2024-05-18 - Avoid frequent API calls from keystroke search updates
**Learning:** In React, placing search terms directly into useEffect dependencies (or useCallback dependencies that are in useEffect) triggers immediate API requests on every keystroke, which hurts frontend performance and increases server load unnecessarily.
**Action:** Always debounce search inputs that trigger API requests locally using `useEffect` with `setTimeout` or a custom useDebounce hook to prevent excessive immediate fetches, without sacrificing code readability.
