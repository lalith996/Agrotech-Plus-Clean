## 2025-02-23 - XSS Vulnerability in Blog Post Render
**Vulnerability:** Found `dangerouslySetInnerHTML` rendering unsanitized blog post content in `pages/blog/[slug].tsx`.
**Learning:** Even static or mock data rendered directly into the DOM can pose a risk if the data source becomes dynamic or user-controlled without strict sanitization, violating the design specification against `dangerouslySetInnerHTML`.
**Prevention:** Always use `isomorphic-dompurify` to sanitize HTML content before rendering it with `dangerouslySetInnerHTML`, especially in Next.js applications where SSR requires an isomorphic solution to prevent hydration mismatches.
