## 2024-05-18 - Fix XSS vulnerability in blog rendering
**Vulnerability:** Cross-Site Scripting (XSS) vulnerability in `pages/blog/[slug].tsx` due to unsanitized use of `dangerouslySetInnerHTML`.
**Learning:** Even though the content comes from a local object (`blogPostsData`), it is best practice to sanitize any HTML before rendering it with `dangerouslySetInnerHTML` to prevent XSS if the data source ever changes (e.g., fetched from an API or database).
**Prevention:** Always sanitize HTML content using a library like `isomorphic-dompurify` before passing it to `dangerouslySetInnerHTML`.
