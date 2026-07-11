## 2024-07-11 - XSS Vulnerability in Blog Component
**Vulnerability:** The `pages/blog/[slug].tsx` component used `dangerouslySetInnerHTML` to render unescaped raw HTML strings directly from variables/database into the DOM, creating an XSS vector.
**Learning:** Even though the project specs say "No dangerouslySetInnerHTML", it was still used for rendering blog articles. Using regular DOMPurify in Next.js causes SSR mismatch issues.
**Prevention:** Use `isomorphic-dompurify` in Next.js when `dangerouslySetInnerHTML` is unavoidable (e.g. rendering rich text content) to ensure HTML is sanitized on both the server and client.
