## 2024-07-17 - Regex-Based HTML Sanitization Flaw
**Vulnerability:** XSS vulnerability and broken formatting due to using aggressive regex-based HTML sanitization (`InputSanitizer.sanitizeHtml`) that strips all tags but can miss complex edge cases or destroy rich text content.
**Learning:** Custom regex for HTML sanitization is error-prone and unsuitable for rich text.
**Prevention:** Always use established, battle-tested libraries like `isomorphic-dompurify` for HTML sanitization in SSR environments.