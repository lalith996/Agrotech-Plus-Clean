## 2023-11-20 - Fix XSS in blog post content
**Vulnerability:** The application was using dangerouslySetInnerHTML to render blog post content without sanitization, which allowed for Cross-Site Scripting (XSS) attacks.
**Learning:** React's dangerouslySetInnerHTML is exactly what its name suggests. Always sanitize HTML input before passing it in. Furthermore, the Next.js project requires `isomorphic-dompurify` to prevent hydration mismatches during server-side rendering, as the standard `dompurify` throws errors on the server.
**Prevention:** Always use `isomorphic-dompurify` in React/Next.js whenever `dangerouslySetInnerHTML` must be used.
