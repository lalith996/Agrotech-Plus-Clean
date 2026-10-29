## 2024-05-01 - XSS via dangerouslySetInnerHTML
**Vulnerability:** XSS vulnerability found when using dangerouslySetInnerHTML without sanitizing the output in Next.js.
**Learning:** React dangerouslySetInnerHTML bypasses XSS protections and allows executing arbitrary scripts if the contents are controlled by user inputs. Also isomorphic-dompurify should be used since regular dompurify requires a global window object, which causes Next.js SSR to crash.
**Prevention:** Always sanitize dynamically rendered contents using isomorphic-dompurify.
