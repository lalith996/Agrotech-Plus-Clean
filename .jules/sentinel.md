## 2024-05-24 - [XSS Vulnerability in Blog Component]
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability was found in `pages/blog/[slug].tsx` where blog post content is rendered using `dangerouslySetInnerHTML` without proper sanitization.
**Learning:** `dangerouslySetInnerHTML` should never be used without sanitizing the input first, especially when the content might come from an untrusted source or when there's no guarantee the backend has already sanitized it. This allows execution of arbitrary JavaScript if a malicious payload is injected into the content.
**Prevention:** Always use a sanitization library like `isomorphic-dompurify` to cleanse HTML content before rendering it with `dangerouslySetInnerHTML`.
