## 2025-10-09 - XSS Vulnerability in Next.js SSR via dangerouslySetInnerHTML
**Vulnerability:** The blog article page (`pages/blog/[slug].tsx`) was directly rendering unsanitized HTML content using `dangerouslySetInnerHTML={{ __html: post.content }}`, exposing the application to Cross-Site Scripting (XSS) vulnerabilities.
**Learning:** Using standard `dompurify` in a Next.js Server-Side Rendering (SSR) environment can cause issues or mismatches. To properly sanitize HTML during SSR and prevent XSS without breaking the app, an isomorphic package is required.
**Prevention:** Always wrap content passed to `dangerouslySetInnerHTML` with `DOMPurify.sanitize()` using the `isomorphic-dompurify` package in Next.js projects.
