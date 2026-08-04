## 2025-02-27 - Replace weak regex-based HTML sanitization with isomorphic-dompurify
**Vulnerability:** A custom regex-based HTML sanitization implementation in `lib/security.ts` was found, which is vulnerable to XSS due to incomplete filtering (e.g. nested tags or complex payloads).
**Learning:** Regex should not be used to parse or sanitize HTML as it is fragile and easily bypassed by determined attackers.
**Prevention:** Always use established, robust security libraries like `isomorphic-dompurify` (DOMPurify) to safely sanitize HTML input instead of reinventing the wheel with regex.
