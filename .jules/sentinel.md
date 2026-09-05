## 2025-03-04 - Fix XSS Vulnerability in Blog Post Rendering
**Vulnerability:** The `dangerouslySetInnerHTML` attribute was used in `/pages/blog/[slug].tsx` to render blog post content without prior sanitization, leading to a potential Cross-Site Scripting (XSS) vulnerability.
**Learning:** Using `dangerouslySetInnerHTML` directly with unsanitized data from an external source or database poses a severe security risk, allowing attackers to inject malicious scripts into the application.
**Prevention:** Always sanitize any HTML content before rendering it using a robust library like `isomorphic-dompurify` to strip away malicious tags and scripts.
