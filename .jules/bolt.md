## 2024-08-12 - Debounce State Anti-pattern
**Learning:** Found multiple instances where search inputs on critical pages (products, farmers, files) trigger un-debounced fetch operations either through direct `onChange` triggers combined with `useEffect` or form submissions. This is a common performance bottleneck causing excessive API calls and rendering churn.
**Action:** Use a debounced state variable approach with `useEffect` and `setTimeout` (or a custom hook) to throttle API requests tied to text input instead of importing non-standard debounce utilities.
