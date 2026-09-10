## 2025-05-18 - XSS vulnerability via dangerouslySetInnerHTML
**Vulnerability:** XSS vulnerability in blog page due to unsanitized dangerouslySetInnerHTML
**Learning:** React dangerouslySetInnerHTML bypasses XSS protection in React. Must sanitize input when parsing dynamic html.
**Prevention:** Sanitize the input content by using a library like isomorphic-dompurify or avoid dangerouslySetInnerHTML when not necessary.
