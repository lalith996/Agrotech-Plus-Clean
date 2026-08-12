## 2024-05-24 - Fix XSS in Blog Rendering
**Vulnerability:** Found `dangerouslySetInnerHTML` in `pages/blog/[slug].tsx` that directly renders unsanitized HTML content, presenting a high risk of XSS attacks.
**Learning:** Reacts `dangerouslySetInnerHTML` must always be paired with a sanitization library like `isomorphic-dompurify` when rendering dynamic content, especially if that content could eventually originate from user input or external databases.
**Prevention:** Use an established sanitization library like `isomorphic-dompurify` for all cases where raw HTML needs to be rendered, replacing risky usage of `dangerouslySetInnerHTML`.
