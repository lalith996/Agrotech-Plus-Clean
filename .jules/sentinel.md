## 2024-03-24 - Cryptographic Insecure Functions Pattern
**Vulnerability:** Usage of `crypto.createCipher` and `crypto.createDecipher` which rely on the deprecated, insecure OpenSSL key derivation function (EVP_BytesToKey) instead of modern secure algorithms (like PBKDF2/scrypt).
**Learning:** `createCipheriv` and `createDecipheriv` should always be used with a securely generated IV instead. It was noticed that `lib/security.ts` derived the key using `crypto.scryptSync(..., ..., 32)` which correctly gives 32 bytes for `aes-256-gcm`. Passing this to the new functions requires the IV to be passed explicitly.
**Prevention:** Linter rules should be updated to ban the use of `createCipher` and `createDecipher` directly.
