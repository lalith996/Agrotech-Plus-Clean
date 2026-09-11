## 2025-05-16 - XSS vulnerability in blog dynamic routes
**Vulnerability:** XSS via `dangerouslySetInnerHTML`
**Learning:** We are using `dangerouslySetInnerHTML` for the blog content. When rendering server-side or handling arbitrary contents without sanitization, an attacker could introduce XSS vulnerabilities. Even though the current content is static, it's best practice to sanitize it when it comes from an external source or database (or is mock data masquerading as such). Next.js needs isomorphic sanitizers to avoid server-side crashes during SSR.
**Prevention:** Use `isomorphic-dompurify` in Next.js projects to sanitize content before setting it with `dangerouslySetInnerHTML`.
