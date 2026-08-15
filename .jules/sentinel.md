## 2024-05-24 - XSS via dangerouslySetInnerHTML
**Vulnerability:** Found un-sanitized HTML being rendered in the blog post component using dangerouslySetInnerHTML.
**Learning:** React's dangerouslySetInnerHTML can execute malicious scripts if the input contains XSS payloads.
**Prevention:** Strictly sanitize any unavoidable HTML injection using isomorphic-dompurify.
