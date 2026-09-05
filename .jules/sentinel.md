## 2024-05-29 - Cross-Site Scripting (XSS) Vulnerability in Blog Posts
**Vulnerability:** Found an XSS vulnerability in `pages/blog/[slug].tsx` where blog post content is rendered using `dangerouslySetInnerHTML` without any sanitization.
**Learning:** Unsanitized user-generated content rendered directly to the DOM can execute malicious scripts.
**Prevention:** Always sanitize HTML strings using a library like `isomorphic-dompurify` before rendering them with `dangerouslySetInnerHTML`.
