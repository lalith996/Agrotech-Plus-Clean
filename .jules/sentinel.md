# Sentinel Journal

## 2024-03-24 - Cross-Site Scripting (XSS) Vulnerability in Next.js Server-Side Rendering
**Vulnerability:** A blog page rendered un-sanitized blog post contents using `dangerouslySetInnerHTML`. Because Next.js renders this server-side, using standard `dompurify` causes SSR crashes as it tries to access the browser's `window` object.
**Learning:** In a Next.js environment, standard `dompurify` cannot be safely used for sanitizing HTML injected via `dangerouslySetInnerHTML`. `isomorphic-dompurify` must be used instead, which handles the lack of `window` objects gracefully in node environments during Server-Side Rendering.
**Prevention:** Always use `isomorphic-dompurify` for DOM sanitization in server-rendered React applications like Next.js, and strictly sanitize data passed to `dangerouslySetInnerHTML`.
