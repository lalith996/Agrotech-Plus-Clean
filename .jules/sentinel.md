## 2023-11-20 - [Fix XSS Vulnerability in Next.js SSR]
**Vulnerability:** Found `dangerouslySetInnerHTML` directly using unsanitized user content in `pages/blog/[slug].tsx` (rendering blog post content).
**Learning:** Standard `dompurify` crashes during Server-Side Rendering (SSR) in Next.js because it relies on the browser's `window` object.
**Prevention:** Always use `isomorphic-dompurify` when sanitizing HTML in Next.js applications, and ensure `dangerouslySetInnerHTML` is never used with raw user input.
