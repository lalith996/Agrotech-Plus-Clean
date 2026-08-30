## 2025-01-01 - Prevent XSS in SSR Pages
**Vulnerability:** Unsanitized HTML rendering using dangerouslySetInnerHTML on the blog post page.
**Learning:** Hydration mismatch errors and standard XSS attacks can happen when rendering rich text content without sanitization in Next.js (SSR). isomorphic-dompurify is an essential security library to protect both Node.js and browser environments against XSS vulnerabilities.
**Prevention:** Always sanitize any untrusted or dynamically rendered HTML content before using dangerouslySetInnerHTML using tools like isomorphic-dompurify.
