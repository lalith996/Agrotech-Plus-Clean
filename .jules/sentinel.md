## 2025-10-24 - Cross-Site Scripting (XSS) in blog posts
**Vulnerability:** Found `dangerouslySetInnerHTML` directly rendering unescaped and unsanitized HTML from the `blogPostsData` content object in `pages/blog/[slug].tsx`.
**Learning:** Always sanitize user-contributed or dynamic HTML content using an appropriate library (e.g., DOMPurify) before injecting it into the DOM to prevent arbitrary script execution. Server-side rendering requires an isomorphic sanitization package.
**Prevention:** Ensure that any usage of `dangerouslySetInnerHTML` passes its input through `isomorphic-dompurify.sanitize()` first.
