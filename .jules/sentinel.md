## 2024-05-18 - Prevent XSS in Blog Articles
**Vulnerability:** XSS vulnerability in `pages/blog/[slug].tsx` through `dangerouslySetInnerHTML`.
**Learning:** React dangerouslySetInnerHTML bypasses normal protection mechanisms, making applications vulnerable to cross-site scripting (XSS) if not handled with care. Next.js does not sanitize user inputs automatically when using this prop.
**Prevention:** Always use safe DOM sanitization libraries, like `isomorphic-dompurify`, when dangerously rendering raw HTML contents, particularly if sourced from an external or user-generated source.
