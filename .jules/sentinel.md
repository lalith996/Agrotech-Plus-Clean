## 2025-10-06 - Prevent XSS with isomorphic-dompurify
**Vulnerability:** XSS vulnerability through `dangerouslySetInnerHTML`
**Learning:** In Next.js SSR apps, use `isomorphic-dompurify` instead of standard `dompurify` to prevent "window is not defined" SSR errors.
**Prevention:** Always sanitize input passed to `dangerouslySetInnerHTML` using `isomorphic-dompurify`.
