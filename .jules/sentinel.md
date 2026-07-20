## 2024-05-20 - Regex HTML Sanitization
**Vulnerability:** The `InputSanitizer.sanitizeHtml` function used regex to strip HTML tags, which is error-prone, bypassable, and aggressively strips all formatting, making it unsuitable for rich text.
**Learning:** Regex should never be used for HTML sanitization because HTML is not a regular language and browser parsing edge cases can easily bypass regex filters.
**Prevention:** Always use a dedicated HTML sanitization library like `isomorphic-dompurify` that actually parses the DOM to safely filter out XSS vectors while preserving safe formatting.
