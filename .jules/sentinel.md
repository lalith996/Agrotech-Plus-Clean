## 2024-05-18 - XSS via dangerouslySetInnerHTML in Blog Post
**Vulnerability:** Found `dangerouslySetInnerHTML` being used directly with `post.content` without sanitization in `pages/blog/[slug].tsx`.
**Learning:** Even static or mock data needs sanitization in React applications when rendered via `dangerouslySetInnerHTML`, as this data could eventually come from a database or API, making it a critical XSS vulnerability.
**Prevention:** Always use a robust HTML sanitization library like `isomorphic-dompurify` before injecting HTML directly into the DOM using `dangerouslySetInnerHTML`.
