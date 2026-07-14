## 2024-05-24 - Cross-Site Scripting (XSS) via dangerouslySetInnerHTML
**Vulnerability:** Unsanitized blog post content rendered directly to the DOM using dangerouslySetInnerHTML in pages/blog/[slug].tsx.
**Learning:** The project design specifications explicitly forbid dangerouslySetInnerHTML without sanitization. If rendering raw HTML is required, we must strictly sanitize using isomorphic-dompurify for SSR compatibility.
**Prevention:** Always use isomorphic-dompurify to sanitize user-provided or dynamic HTML content before injecting it into the DOM to prevent XSS.
