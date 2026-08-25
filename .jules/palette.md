## 2024-12-09 - Search Combobox ARIA Issue
**Learning:** `role="searchbox"` does not support `aria-expanded`. When building a search input with autocomplete suggestions, `role="combobox"` should be used instead to properly support `aria-expanded` and `aria-controls` for screen readers.
**Action:** Always use `role="combobox"` for search inputs that feature a dropdown list of suggestions.
