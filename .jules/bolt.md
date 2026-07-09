## 2024-07-09 - React Search API Flooding

**Learning:** Uncontrolled keystroke event handlers on generic Next.js search pages cause an immediate API flood to the backend with every individual letter typed, increasing network load and server stress unnecessarily.

**Action:** Standardize the use of a lightweight `useDebounce` hook (e.g. 500ms delay) on search input states and wrap API trigger dependencies with the debounced value instead of raw state to severely optimize React fetching.
