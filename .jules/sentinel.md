## 2025-03-08 - Fix XSS vulnerability in blog posts
**Vulnerability:** Unsanitized HTML passed to dangerouslySetInnerHTML
**Learning:** External or static content shouldn't be implicitly trusted without sanitization, even if sourced from internal CMS-like data structures.
**Prevention:** Always use a well-maintained sanitizer like isomorphic-dompurify whenever dangerouslySetInnerHTML is used.
