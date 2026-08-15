## 2024-05-18 - Debouncing Search Inputs
**Learning:** Adding debouncing to search inputs that trigger backend API calls on every keystroke significantly reduces unnecessary network traffic and database load, preventing server strain and improving frontend responsiveness, especially when users type quickly.
**Action:** Always implement debouncing (e.g., using `useDebounce`) for text inputs that immediately trigger expensive operations like network requests or complex filtering.
