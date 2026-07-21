## 2024-05-31 - XSS in Blog Posts
**Vulnerability:** The blog post content is rendered using dangerouslySetInnerHTML without sanitization.
**Learning:** dangerouslySetInnerHTML is forbidden by design specs. If necessary, it must be sanitized.
**Prevention:** Always use isomorphic-dompurify when dangerouslySetInnerHTML is unavoidable.
