## 2024-05-27 - Cross-Site Scripting (XSS) vulnerability via dangerouslySetInnerHTML
**Vulnerability:** Found `dangerouslySetInnerHTML` in `pages/blog/[slug].tsx` that directly renders unsanitized content.
**Learning:** React's `dangerouslySetInnerHTML` bypasses standard escaping. It should not be used to render HTML directly without a robust sanitizer like `isomorphic-dompurify`.
**Prevention:** Avoid `dangerouslySetInnerHTML` where possible, or strictly sanitize inputs with tools like `isomorphic-dompurify` before passing them to the component.
