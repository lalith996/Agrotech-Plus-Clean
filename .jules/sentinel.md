## 2026-07-18 - XSS Vulnerability in Rich Text Rendering
**Vulnerability:** The blog post component (`pages/blog/[slug].tsx`) was passing raw HTML content directly to `dangerouslySetInnerHTML`, creating a severe XSS vulnerability.
**Learning:** The existing `InputSanitizer.sanitizeHtml` (using aggressive regex) is unsuitable for rich text because it strips all formatting. Additionally, standard `dompurify` causes hydration mismatches in Next.js.
**Prevention:** Use `isomorphic-dompurify` for SSR-compatible, formatting-safe sanitization whenever `dangerouslySetInnerHTML` is unavoidable.
