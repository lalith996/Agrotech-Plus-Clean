## 2024-08-16 - Deprecated Crypto Functions
**Vulnerability:** Used deprecated `crypto.createCipher` and `crypto.createDecipher` methods.
**Learning:** Legacy crypto methods are dangerous because they derive keys using weak algorithms (MD5), treat raw keys as passwords, and fail entirely in Node 22+ for AEAD modes like `aes-256-gcm`.
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv` with properly generated IVs (e.g., 12 bytes for GCM) and explicitly pass the key and IV.
