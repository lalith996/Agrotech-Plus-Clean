## 2024-05-18 - XSS in React via dangerouslySetInnerHTML

**Vulnerability:** User-provided or dynamically loaded content (e.g., blog posts) is rendered directly into the DOM using `dangerouslySetInnerHTML` without any prior HTML sanitization, allowing arbitrary scripts to execute.
**Learning:** React's `dangerouslySetInnerHTML` bypasses its built-in XSS protections. Therefore, any content passed to it must be trusted or explicitly sanitized beforehand to prevent XSS attacks.
**Prevention:** Always sanitize dynamic HTML content using utilities like `InputSanitizer.sanitizeHtml` (or a dedicated library like DOMPurify) before passing it to `dangerouslySetInnerHTML`.
