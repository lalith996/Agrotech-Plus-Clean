## 2025-02-23 - XSS Vulnerability in Blog Post Content
**Vulnerability:** Found `dangerouslySetInnerHTML={{ __html: post.content }}` without any sanitization in `pages/blog/[slug].tsx`.
**Learning:** React's `dangerouslySetInnerHTML` bypasses its built-in XSS protection. If content originates from or can be influenced by users, this leads directly to XSS. In SSR contexts like Next.js, `isomorphic-dompurify` must be used to sanitize HTML both on the server and the client to avoid hydration mismatches.
**Prevention:** Always sanitize HTML input using a library like DOMPurify before passing it to `dangerouslySetInnerHTML`. Add linting rules to flag unsanitized usage of `dangerouslySetInnerHTML`.
