## 2025-02-18 - XSS Vulnerability in Blog Component
**Vulnerability:** XSS vulnerability found in `pages/blog/[slug].tsx` via `dangerouslySetInnerHTML`
**Learning:** Next.js uses `dangerouslySetInnerHTML` to render HTML which can introduce XSS risks if the data source isn't sanitized.
**Prevention:** Sanitize data using `isomorphic-dompurify` prior to using `dangerouslySetInnerHTML`.
