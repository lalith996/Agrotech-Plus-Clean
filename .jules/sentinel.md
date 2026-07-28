## 2024-05-23 - XSS Vulnerability in Blog Rendering
**Vulnerability:** Unsanitized user content (`post.content`) was directly rendered using React's `dangerouslySetInnerHTML` in `pages/blog/[slug].tsx`, exposing the application to XSS attacks.
**Learning:** Hardcoded data or seemingly safe user input rendered via `dangerouslySetInnerHTML` is a critical vector for XSS if not properly sanitized.
**Prevention:** Always use a sanitization library like `isomorphic-dompurify` when rendering raw HTML content.
