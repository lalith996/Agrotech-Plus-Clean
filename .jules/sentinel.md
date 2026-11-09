## 2025-03-01 - [XSS Vulnerability in Blog Component]
**Vulnerability:** XSS vulnerability in `pages/blog/[slug].tsx` due to `dangerouslySetInnerHTML` being used with unsanitized `post.content`.
**Learning:** Even static or mock data components should have proper sanitization to prevent future XSS issues when the data source changes to dynamic content.
**Prevention:** Always use a sanitizer like `isomorphic-dompurify` when rendering raw HTML using `dangerouslySetInnerHTML`.
