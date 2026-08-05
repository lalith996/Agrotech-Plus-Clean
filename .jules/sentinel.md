## 2026-08-05 - Replace Regex-Based Sanitization
**Vulnerability:** Regex-based sanitization in `InputSanitizer.sanitizeHtml` does not safely prevent XSS and may be bypassed by complex payloads.
**Learning:** Regex alone cannot adequately parse and sanitize complex HTML, leaving the codebase vulnerable to XSS.
**Prevention:** Always use a dedicated HTML parsing and sanitization library like `isomorphic-dompurify`.
