## 2025-02-14 - SSR-Compatible XSS Sanitization in Next.js

**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability was found in `pages/blog/[slug].tsx` where external `post.content` was rendered directly via `dangerouslySetInnerHTML` without sanitization.

**Learning:** When sanitizing HTML to prevent XSS in Next.js applications that utilize Server-Side Rendering (SSR), standard `dompurify` cannot be used directly as it expects a browser environment (`window`). This causes server crashes during SSR.

**Prevention:** Always use `isomorphic-dompurify` instead of standard `dompurify` for HTML sanitization in SSR frameworks like Next.js to ensure safe and compatible rendering across both server and client environments.
