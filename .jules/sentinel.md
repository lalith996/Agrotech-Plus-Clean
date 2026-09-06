## 2025-03-09 - [Fix XSS in Blog Post Rendering]
**Vulnerability:** The blog post content was directly rendered using `dangerouslySetInnerHTML` without any sanitization in `pages/blog/[slug].tsx`.
**Learning:** Raw HTML content from data sources should never be trusted or rendered directly, even if it comes from an internal data structure, as it could be modified or injected with malicious scripts.
**Prevention:** Always sanitize HTML content using libraries like `isomorphic-dompurify` before rendering it with `dangerouslySetInnerHTML`.
