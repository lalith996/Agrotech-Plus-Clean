## 2025-05-15 - XSS Vulnerability in Blog Rendering
**Vulnerability:** Found `dangerouslySetInnerHTML` being used to render blog post content in `pages/blog/[slug].tsx` without proper sanitization.
**Learning:** React's `dangerouslySetInnerHTML` is susceptible to Cross-Site Scripting (XSS) if the HTML content is not sanitized beforehand, as malicious scripts embedded in the content will be executed.
**Prevention:** Always sanitize HTML content from external sources or databases using a library like `isomorphic-dompurify` before passing it to `dangerouslySetInnerHTML`.
