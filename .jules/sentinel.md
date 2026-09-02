## 2023-10-27 - [XSS vulnerability via dangerouslySetInnerHTML]
**Vulnerability:** Found un-sanitized user input being rendered using dangerouslySetInnerHTML in the blog page.
**Learning:** React dangerouslySetInnerHTML bypasses normal protection mechanisms and can lead to Cross-Site Scripting (XSS) if not properly sanitized.
**Prevention:** Always sanitize any dynamic or user-generated HTML content before passing it to dangerouslySetInnerHTML. Use a robust library like DOMPurify or isomorphic-dompurify in SSR contexts.
