## 2024-05-24 - Cross-Site Scripting (XSS) via dangerouslySetInnerHTML
**Vulnerability:** Found an unescaped `dangerouslySetInnerHTML` usage in `pages/blog/[slug].tsx` that directly rendered HTML content without sanitization.
**Learning:** React requires explicit sanitization when rendering raw HTML using `dangerouslySetInnerHTML`. Relying on trusted sources is a common oversight that exposes applications to stored or reflected XSS attacks.
**Prevention:** Always use a robust HTML sanitization library, like `isomorphic-dompurify`, before rendering any dynamic or potentially untrusted HTML content in React components.
