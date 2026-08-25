## 2025-10-25 - XSS Vulnerability in Blog Post Rendering
**Vulnerability:** Found a Cross-Site Scripting (XSS) vulnerability in `pages/blog/[slug].tsx` where blog post content is rendered using `dangerouslySetInnerHTML={{ __html: post.content }}` without any sanitization.
**Learning:** Even internal or static data should be sanitized before rendering with `dangerouslySetInnerHTML` to prevent potential XSS attacks, especially if the content source might change or be dynamically populated in the future. In a Next.js environment, `isomorphic-dompurify` should be used instead of standard `dompurify` to prevent hydration mismatch errors.
**Prevention:** Always use a sanitization library like `isomorphic-dompurify` when using `dangerouslySetInnerHTML`.
