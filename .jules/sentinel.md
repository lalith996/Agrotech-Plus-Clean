## 2026-08-08 - Critical Security Issue Found
**Vulnerability:** Use of deprecated and insecure `crypto.createCipher` and `crypto.createDecipher` functions with `aes-256-gcm` in `lib/security.ts`.
**Learning:** These functions are deprecated in Node.js, and `createCipher` treats keys as passwords deriving them using weak algorithms like MD5. Furthermore, `createDecipher` throws native errors in Node 22+ for AEAD modes (like `aes-256-gcm`). Therefore, they must be upgraded to `createCipheriv` and `createDecipheriv`.
**Prevention:** Use `crypto.createCipheriv` and `crypto.createDecipheriv` instead. Ensure the key length matches the algorithm requirements (32 bytes for aes-256-gcm) and that an initialization vector (IV) of the correct length (12 bytes for GCM) is passed.
