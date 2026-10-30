## 2024-05-24 - Fix XSS Vulnerability in Blog Component
**Vulnerability:** Found XSS vulnerability via dangerouslySetInnerHTML in pages/blog/[slug].tsx
**Learning:** Next.js SSR means dompurify needs isomorphic-dompurify wrapper.
**Prevention:** Always sanitize dangerouslySetInnerHTML with isomorphic-dompurify in Next.js.
