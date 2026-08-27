## 2025-02-21 - Fix XSS Vulnerability in Blog Post

**Vulnerability:** The blog post component rendered user-supplied HTML content (`post.content`) directly using `dangerouslySetInnerHTML` without any sanitization.
**Learning:** React's `dangerouslySetInnerHTML` should never be used on unsanitized user inputs because it directly evaluates HTML, opening up Cross-Site Scripting (XSS) vulnerabilities.
**Prevention:** Always sanitize any untrusted or user-supplied HTML content before rendering it with `dangerouslySetInnerHTML`. In a Next.js (SSR) environment, it's recommended to use `isomorphic-dompurify`.
