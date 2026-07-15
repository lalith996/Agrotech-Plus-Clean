## 2024-05-23 - XSS Vulnerability in Blog Component
**Vulnerability:** Unsanitized HTML rendering using dangerouslySetInnerHTML in the blog post component.
**Learning:** Using dangerouslySetInnerHTML without sanitization creates an XSS risk if the content source is ever modified to include user input or dynamic external data.
**Prevention:** Always use isomorphic-dompurify to sanitize HTML content before rendering it with dangerouslySetInnerHTML.
