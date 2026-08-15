## 2024-05-24 - Unsanitized HTML rendering in Blog
**Vulnerability:** XSS vulnerability in blog posts rendering via dangerouslySetInnerHTML without proper sanitization.
**Learning:** The application renders rich text content for blog posts but lacks sanitization, leading to potential Cross-Site Scripting (XSS) if the content is malicious.
**Prevention:** Use `isomorphic-dompurify` to sanitize HTML content before rendering it with `dangerouslySetInnerHTML` to ensure safety and SSR compatibility.
