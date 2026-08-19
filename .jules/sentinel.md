## 2024-08-19 - Prevent XSS in Blog Articles
**Vulnerability:** The blog article page used dangerouslySetInnerHTML without sanitizing the content first, exposing the site to potential Cross-Site Scripting (XSS).
**Learning:** Using dangerouslySetInnerHTML directly with unsanitized data is a significant security risk. Since this is a Next.js (SSR) context, isomorphic-dompurify must be used instead of standard dompurify to avoid hydration mismatch errors.
**Prevention:** Always use isomorphic-dompurify to sanitize HTML content before passing it to dangerouslySetInnerHTML.
