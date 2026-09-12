## 2023-10-27 - [CRITICAL] Prevent XSS in dynamically rendered blog content
**Vulnerability:** Found dangerouslySetInnerHTML={{ __html: post.content }} in pages/blog/\[slug\].tsx without prior sanitization, allowing potential Cross-Site Scripting (XSS).
**Learning:** Dynamically rendering raw HTML content, especially from a CMS or external data source, directly exposes the application to XSS attacks if the content is not sanitized.
**Prevention:** Always use a robust HTML sanitizer like isomorphic-dompurify (which works on both client and server sides in Next.js) before passing HTML strings to dangerouslySetInnerHTML.
