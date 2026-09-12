## 2025-02-12 - Prevent XSS in SSR applications
**Vulnerability:** Found a Cross-Site Scripting (XSS) vulnerability in `pages/blog/[slug].tsx` where unsanitized user content is rendered using `dangerouslySetInnerHTML`.
**Learning:** Next.js applications run on the server and the client. Using a library like `isomorphic-dompurify` provides consistent HTML sanitization that works across SSR and client rendering, avoiding crashes compared to standard DOMPurify.
**Prevention:** Always sanitize any dynamic or user-generated HTML content before passing it to `dangerouslySetInnerHTML`. Never trust external content directly.
