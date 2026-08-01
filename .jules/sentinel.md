## 2024-08-01 - Fix XSS Vulnerability in HTML Sanitization
**Vulnerability:** A custom regex-based implementation (`<script[^>]*>.*?<\/script>`) was used for HTML sanitization in `lib/security.ts`, which is highly susceptible to bypasses (e.g., nested tags, malformed tags, execution in SVG, etc.), and this flawed logic was coupled with `dangerouslySetInnerHTML` in `pages/blog/[slug].tsx`.
**Learning:** Custom regex should never be used to sanitize HTML due to the complexity and edge cases of HTML parsing. It's too easy to miss attack vectors.
**Prevention:** Always use established, robust security libraries like `DOMPurify` (or `isomorphic-dompurify` in Next.js/SSR environments) for sanitizing any user-supplied HTML before rendering it in the DOM.
