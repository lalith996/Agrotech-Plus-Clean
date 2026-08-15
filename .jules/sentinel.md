## 2026-07-13 - XSS Vulnerability in Server-Side Rendered Blog Post
**Vulnerability:** A Cross-Site Scripting (XSS) vulnerability was found in the `pages/blog/[slug].tsx` file, where unsanitized HTML content from `post.content` was rendered using `dangerouslySetInnerHTML`.
**Learning:** Next.js Server-Side Rendering (SSR) environments require specific sanitation libraries like `isomorphic-dompurify`. Standard `dompurify` relies on the `window` object and breaks during SSR, causing server-crashing regressions.
**Prevention:** Always sanitize any dynamic or user-generated HTML content before injecting it into the DOM using `dangerouslySetInnerHTML`. In SSR environments like Next.js, ensure to use SSR-compatible sanitation libraries such as `isomorphic-dompurify`.
