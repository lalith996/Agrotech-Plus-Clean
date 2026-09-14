## 2025-02-14 - XSS via dangerouslySetInnerHTML
**Vulnerability:** The `pages/blog/[slug].tsx` uses `dangerouslySetInnerHTML` to render blog post content without sanitization, leaving it open to Cross-Site Scripting (XSS).
**Learning:** Even internal static data can be a vector if it's eventually driven by an external source or database (or if an attacker can somehow influence the content). Always sanitize HTML before rendering it with `dangerouslySetInnerHTML`.
**Prevention:** Use `isomorphic-dompurify` to sanitize HTML content in Next.js applications before rendering it with `dangerouslySetInnerHTML`.
