## 2025-02-27 - [Fix XSS Vulnerability in Blog Post Rendering]
**Vulnerability:** Used `dangerouslySetInnerHTML` directly with unsanitized `post.content`
**Learning:** `dangerouslySetInnerHTML` in server-side rendered frameworks (like Next.js) requires specialized DOM sanitization libraries such as `isomorphic-dompurify`. Using standard `dompurify` may lead to hydration mismatches or crash during SSR, therefore `isomorphic-dompurify` must be explicitly chosen.
**Prevention:** Avoid `dangerouslySetInnerHTML` when possible. If required, always sanitize HTML strings using `isomorphic-dompurify.sanitize()` prior to rendering. Ensure that sanitization is done on both the server and client uniformly.
