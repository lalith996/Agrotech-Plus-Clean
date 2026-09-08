## 2025-02-28 - XSS Vulnerability in Blog Component
**Vulnerability:** dangerouslySetInnerHTML used directly with raw string content in blog posts component (`pages/blog/[slug].tsx`).
**Learning:** Using `dangerouslySetInnerHTML` directly without sanitization leads to Cross-Site Scripting (XSS) if the content is malicious.
**Prevention:** Always use a sanitization library like DOMPurify or the built-in InputSanitizer when rendering raw HTML content.
