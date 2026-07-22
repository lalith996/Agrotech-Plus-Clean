## 2024-05-24 - Replace regex HTML sanitization with isomorphic-dompurify
**Vulnerability:** The application was using regex to sanitize HTML inputs, which is prone to bypasses and aggressively strips all safe HTML formatting.
**Learning:** Using regex to strip HTML tags makes it unsuitable for rich text content and introduces bypass risks.
**Prevention:** Always use established, robust sanitization libraries like `isomorphic-dompurify` to sanitize HTML inputs safely without removing legitimate formatting.
