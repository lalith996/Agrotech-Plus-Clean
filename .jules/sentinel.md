## 2025-05-18 - Deprecated Crypto Functions
**Vulnerability:** Found crypto.createCipher being used for encryption.
**Learning:** crypto.createCipher and crypto.createDecipher are completely removed in Node 22+, breaking the app and preventing a legacy fallback from working. crypto.createCipheriv with a 12-byte IV must be used instead for aes-256-gcm.
**Prevention:** Use crypto.createCipheriv with an initialization vector instead of createCipher.
