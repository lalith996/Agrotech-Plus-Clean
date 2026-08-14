## 2024-08-14 - Fix Cross-Site Scripting (XSS) in Blog Rendering
**Vulnerability:** The blog post page directly rendered HTML content using `dangerouslySetInnerHTML` without any sanitization, creating a high-risk XSS vulnerability.
**Learning:** Even internal or trusted content should be sanitized before rendering to prevent malicious scripts from being executed if the content source is ever compromised or modified by an attacker.
**Prevention:** Always use a robust HTML sanitization library (like `isomorphic-dompurify` for Next.js/SSR environments) to clean HTML content before passing it to `dangerouslySetInnerHTML`.
