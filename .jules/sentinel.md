## 2024-05-18 - XSS via dangerouslySetInnerHTML
**Vulnerability:** Found `dangerouslySetInnerHTML` rendering unsanitized blog post content in `pages/blog/[slug].tsx`.
**Learning:** React's `dangerouslySetInnerHTML` bypasses XSS protection. Whenever rendering dynamic HTML content from an external source or database, it must be sanitized.
**Prevention:** Always use `isomorphic-dompurify` (or `dompurify` for client-only code) to sanitize content before passing it to `dangerouslySetInnerHTML`.
