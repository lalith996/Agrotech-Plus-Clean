## 2025-05-20 - XSS Vulnerability in Blog Post Rendering
**Vulnerability:** Found a Cross-Site Scripting (XSS) vulnerability in `pages/blog/[slug].tsx` where blog post content is rendered using `dangerouslySetInnerHTML` without proper sanitization.
**Learning:** `dangerouslySetInnerHTML` should never be used without first sanitizing the input, even if the content originates from a known source, to prevent malicious scripts from being executed in the user's browser.
**Prevention:** Always sanitize HTML input using a library like `isomorphic-dompurify` before rendering it with `dangerouslySetInnerHTML`.
