## 2024-07-17 - XSS Vulnerability in Blog Rendering
**Vulnerability:** The blog post content in `pages/blog/[slug].tsx` was rendered directly using `dangerouslySetInnerHTML` without sanitization, exposing the application to Cross-Site Scripting (XSS).
**Learning:** Always sanitize rich text content on the client/server before rendering, especially when bypass mechanisms like `dangerouslySetInnerHTML` are used. `isomorphic-dompurify` should be used instead of standard regex replacements which are insufficient for rich text.
**Prevention:** Enforce the use of `isomorphic-dompurify` alongside `dangerouslySetInnerHTML` in SSR-compatible Next.js environments and ensure all user-provided or dynamic content is sanitized.
