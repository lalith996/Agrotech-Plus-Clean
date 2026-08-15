## 2025-10-24 - SSR-Compatible XSS Prevention
**Vulnerability:** XSS via dangerouslySetInnerHTML in Next.js pages.
**Learning:** Standard DOMPurify can fail during Server-Side Rendering (SSR) in Next.js because it expects a DOM environment.
**Prevention:** Use the `isomorphic-dompurify` package which provides a fallback for SSR environments when sanitizing HTML for dangerouslySetInnerHTML.
