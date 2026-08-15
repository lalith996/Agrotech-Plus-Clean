## 2025-02-27 - Deprecated Crypto Functions
**Vulnerability:** Use of deprecated `crypto.createCipher` and `crypto.createDecipher` which rely on MD5 derivation and treat keys as passwords. Furthermore, these are completely removed in Node 22+ causing application crashes.
**Learning:** `aes-256-gcm` requires a 12-byte IV for optimal security and performance, and the correct API is `createCipheriv`/`createDecipheriv` passing the key and IV. Legacy fallback isn't possible because the old functions are removed in the current runtime environment.
**Prevention:** Always use `createCipheriv` and `createDecipheriv` with a strong random IV. Ensure IV length is appropriate for the algorithm (12 bytes for GCM).
