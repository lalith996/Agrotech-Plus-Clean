## 2025-05-15 - XSS Vulnerability in Blog Component
**Vulnerability:** The blog component uses dangerouslySetInnerHTML to render blog posts without sanitization.
**Learning:** React components that render HTML from an external source or database using dangerouslySetInnerHTML are vulnerable to XSS if not sanitized. Next.js applications need special handling with isomorphic-dompurify.
**Prevention:** Always sanitize HTML input before passing it to dangerouslySetInnerHTML, using tools like isomorphic-dompurify in Next.js.
