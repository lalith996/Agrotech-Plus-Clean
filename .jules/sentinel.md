## 2026-08-06 - Upgrade Deprecated Cryptographic Functions
**Vulnerability:** Use of deprecated `crypto.createCipher` and `crypto.createDecipher` functions with AEAD mode `aes-256-gcm`.
**Learning:** `createCipher` derives keys using MD5 and is insecure. Additionally, `createDecipher` throws native errors in Node 22+ for AEAD modes, making legacy fallback impossible.
**Prevention:** Use `crypto.createCipheriv` and `crypto.createDecipheriv` instead, passing the IV explicitly.
