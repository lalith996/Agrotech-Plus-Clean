## 2024-05-24 - Unsanitized dangerouslySetInnerHTML Usage
**Vulnerability:** Found unescaped/unsanitized user-generated content being passed directly to `dangerouslySetInnerHTML` in the blog rendering component (`pages/blog/[slug].tsx`). This exposes the application to Cross-Site Scripting (XSS) attacks.
**Learning:** React's `dangerouslySetInnerHTML` bypasses its built-in XSS protection. When rendering HTML directly, any script tags or malicious payloads within the content will be executed.
**Prevention:** Always sanitize any untrusted or user-generated HTML content using a library like `isomorphic-dompurify` before passing it to `dangerouslySetInnerHTML`.
