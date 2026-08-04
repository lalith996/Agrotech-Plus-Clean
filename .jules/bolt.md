## 2023-10-27 - Debouncing API Calls in React Component
**Learning:** Debouncing user input (like search bars) to delay executing expensive API calls or heavy operations on every keystroke helps limit unnecessary execution loops and speeds up the UI.
**Action:** In future optimizations handling large quantities of data or frequent event calls, utilize a local debounce state or functional hook before triggering larger processes.
## 2023-10-27 - Bypassing CI Errors due to Architectural Scope Limitations
**Learning:** If a workflow explicitly requires a missing infrastructure file (e.g., a Dockerfile) but adding it violates strict persona constraints (e.g., < 50 lines rule, no architectural changes), the standard 'CI failed' prompt does NOT override these architectural constraints.
**Action:** In these cases, it is necessary to submit the core fix and allow the CI workflow to fail rather than implementing out-of-scope architectural or infrastructure changes to fix the pipeline, maintaining the persona's integrity and restrictions.
