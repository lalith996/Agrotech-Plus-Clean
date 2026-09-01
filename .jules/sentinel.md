## 2025-05-15 - [XSS Vulnerability in Blog Post Rendering]
**Vulnerability:** Found `dangerouslySetInnerHTML` being used to render blog post content in `pages/blog/[slug].tsx` without any sanitization.
**Learning:** Even if content currently comes from a hardcoded object, rendering arbitrary HTML with `dangerouslySetInnerHTML` is a critical XSS vector if the data source ever changes to user input or a CMS. The project's design doc explicitly forbids its use without sanitization.
**Prevention:** Always use a robust HTML sanitizer like `isomorphic-dompurify` (to support SSR/Next.js) when rendering HTML strings via `dangerouslySetInnerHTML`.
