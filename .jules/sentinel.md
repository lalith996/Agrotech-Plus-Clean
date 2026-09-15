## 2025-01-01 - XSS Vulnerability in SSR React Apps
**Vulnerability:** Found `dangerouslySetInnerHTML` directly rendering unsanitized HTML in Next.js.
**Learning:** Standard `dompurify` crashes during server-side rendering (SSR) because it relies on the DOM.
**Prevention:** Always use `isomorphic-dompurify` for HTML sanitization in Next.js or other SSR environments to prevent both XSS and SSR crashes.
