## 2024-03-20 - [XSS Vulnerability in dangerouslySetInnerHTML]
**Vulnerability:** Found un-sanitized user input/content rendered using dangerouslySetInnerHTML.
**Learning:** The use of dangerouslySetInnerHTML without proper sanitization can lead to Cross-Site Scripting (XSS).
**Prevention:** Always sanitize any dynamic or user-generated HTML content before rendering it using isomorphic-dompurify or dompurify.
