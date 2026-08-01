## 2024-08-01 - Replace Regex HTML Sanitization with DOMPurify
**Vulnerability:** Regex-based HTML sanitization is inherently flawed and can be bypassed to cause XSS or other injection attacks.
**Learning:** The `InputSanitizer.sanitizeHtml` function in `lib/security.ts` was using regex to strip HTML tags, which is insecure and prone to edge cases.
**Prevention:** Always use a robust, established library like `isomorphic-dompurify` to sanitize HTML.
