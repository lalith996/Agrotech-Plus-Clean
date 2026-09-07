## 2024-05-18 - Missing debounce on search
**Learning:** The products list page (`pages/products/index.tsx`) performs API requests on every keystroke when searching, causing significant backend load and potential frontend stutter due to re-renders from uncontrolled state.
**Action:** Implement debouncing for search input to significantly reduce API calls and improve performance.
