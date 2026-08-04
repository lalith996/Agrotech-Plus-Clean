## 2025-08-04 - Fixed flawed regex-based HTML sanitization
**Vulnerability:** The regex-based HTML sanitization in `lib/security.ts` was flawed and could be bypassed, leading to XSS vulnerabilities.
**Learning:** Regex is rarely sufficient for safely sanitizing HTML content due to the complexity of HTML parsing. It's better to use established libraries like DOMPurify.
**Prevention:** Use an established HTML sanitization library (like `isomorphic-dompurify`) rather than relying on custom regex replacements.
