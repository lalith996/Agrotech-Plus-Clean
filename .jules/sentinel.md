## 2024-05-18 - Fix XSS in dangerouslySetInnerHTML
**Vulnerability:** XSS vulnerability in `pages/blog/[slug].tsx` via `dangerouslySetInnerHTML`.
**Learning:** React's SSR requires specific sanitization libraries like `isomorphic-dompurify` to prevent hydration mismatches and crashes during SSR when dealing with `dangerouslySetInnerHTML`.
**Prevention:** Always use `isomorphic-dompurify` for sanitizing HTML in Next.js/SSR environments instead of standard `dompurify`.
