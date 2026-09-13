## 2025-03-08 - [XSS in Blog Post Rendering]
**Vulnerability:** Unsanitized HTML rendering via dangerouslySetInnerHTML
**Learning:** Rendering user-generated HTML without sanitization leads to XSS. In Next.js, using isomorphic-dompurify instead of standard dompurify prevents SSR crashes.
**Prevention:** Always use isomorphic-dompurify to sanitize HTML content before passing it to dangerouslySetInnerHTML in React/Next.js applications.
