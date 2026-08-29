## 2024-05-30 - Prevent XSS in SSR React with isomorphic-dompurify
**Vulnerability:** XSS vulnerability found in pages/blog/[slug].tsx via unsanitized dangerouslySetInnerHTML={{ __html: post.content }}.
**Learning:** When sanitizing HTML in a Next.js (SSR) context, use isomorphic-dompurify rather than standard dompurify to prevent hydration mismatch errors and ensure secure execution across both Node.js and browser environments.
**Prevention:** Always sanitize dynamic HTML content before injecting it into dangerouslySetInnerHTML. Use isomorphic-dompurify in Next.js applications to avoid SSR hydration issues.
