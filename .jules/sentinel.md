## 2024-03-24 - Cross-Site Scripting (XSS) in Blog Post Rendering
**Vulnerability:** XSS vulnerability in `pages/blog/[slug].tsx` via `dangerouslySetInnerHTML`.
**Learning:** `dangerouslySetInnerHTML` was used without any HTML sanitization, allowing arbitrary JavaScript execution.
**Prevention:** Always use a sanitizer like `isomorphic-dompurify` when rendering untrusted HTML content via `dangerouslySetInnerHTML`.
