## 2025-05-24 - Avoid dangerouslySetInnerHTML
**Vulnerability:** XSS vulnerability through dangerouslySetInnerHTML.
**Learning:** Using `dangerouslySetInnerHTML` allows direct injection of HTML and script tags into the page. The built-in InputSanitizer uses regex which is not robust enough.
**Prevention:** Use `isomorphic-dompurify` to safely sanitize rich HTML content before rendering it.
