## 2024-05-18 - XSS Vulnerability in Blog Content Rendering
**Vulnerability:** The blog article component (`pages/blog/[slug].tsx`) was using `dangerouslySetInnerHTML` to render HTML content from `blogPostsData` directly without any sanitization. This is a classic Cross-Site Scripting (XSS) vulnerability if the content source is ever modified by users or if malicious data is injected.
**Learning:** In Next.js (which uses Server-Side Rendering), standard `dompurify` can cause issues or mismatches. We must use `isomorphic-dompurify` to ensure safe HTML rendering on both server and client.
**Prevention:** Always wrap variables passed to `dangerouslySetInnerHTML` with `DOMPurify.sanitize()`, and specifically use `isomorphic-dompurify` in this Next.js codebase.
