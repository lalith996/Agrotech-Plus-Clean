## 2024-07-15 - Created Journal
**Learning:** Initializing journal for Bolt persona to log performance findings.
**Action:** Always maintain the journal with critical learnings.
## 2024-07-15 - Debounce Search Inputs
**Learning:** React state updates triggering full API re-fetches per keystroke cause immense backend load and UI stuttering on search pages.
**Action:** Always implement debouncing using a local input state combined with a delayed sync to the main query state (or API call) for text inputs that trigger network requests.
