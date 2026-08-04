## 2025-08-04 - Fixed XSS vulnerability in Blog rendering
**Vulnerability:** XSS vulnerability in `pages/blog/[slug].tsx` via `dangerouslySetInnerHTML` rendering unsanitized HTML content from `post.content`.
**Learning:** React components that render HTML directly should always sanitize the input first, especially when the source of the content can't be fully trusted, or to maintain a defense-in-depth posture even with seemingly static/trusted content.
**Prevention:** Always use `isomorphic-dompurify`'s `DOMPurify.sanitize()` method to wrap HTML before using `dangerouslySetInnerHTML`.
