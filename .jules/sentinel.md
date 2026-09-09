## 2024-05-18 - [Fix XSS Vulnerability in Blog Component]
**Vulnerability:** XSS vulnerability found in `pages/blog/[slug].tsx` due to unsanitized `dangerouslySetInnerHTML`.
**Learning:** Always sanitize user-provided or dynamically generated HTML content before rendering it with `dangerouslySetInnerHTML`.
**Prevention:** Use a sanitization library like `isomorphic-dompurify` (which works safely on SSR like Next.js) to clean HTML content before rendering.
