## 2025-02-28 - [React XSS via dangerouslySetInnerHTML]
**Vulnerability:** [Usage of dangerouslySetInnerHTML without sanitization on user input]
**Learning:** [Directly mapping user content to DOM nodes allows arbitrary script execution]
**Prevention:** [Always sanitize HTML inputs (e.g., using isomorphic-dompurify) prior to rendering]
