## 2025-02-28 - Sanitize User Input in Blog Posts
**Vulnerability:** XSS vulnerability in blog posts rendering via `dangerouslySetInnerHTML` without proper sanitization.
**Learning:** React's `dangerouslySetInnerHTML` executes raw HTML content, posing a high security risk if the content is not sanitized.
**Prevention:** Use an HTML sanitizer like `isomorphic-dompurify` on dynamic content before rendering it.
