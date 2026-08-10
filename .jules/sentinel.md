## 2024-05-24 - Cryptographic functions in Node 22
**Vulnerability:** Use of deprecated `crypto.createCipher` and `crypto.createDecipher` functions which were removed in Node 22, resulting in runtime errors (`crypto.createCipher is not a function`).
**Learning:** `crypto.createCipher` and `crypto.createDecipher` treat the key as a password and internally derive a different key using MD5. They have been completely removed from Node 22+.
**Prevention:** Use `crypto.createCipheriv` and `crypto.createDecipheriv` with a proper Initialization Vector (IV). Since the deprecated functions are undefined in Node 22+ for AEAD modes like `aes-256-gcm`, providing a legacy fallback is impossible and should be skipped.
