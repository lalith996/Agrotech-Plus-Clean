## 2024-08-24 - Upgraded Deprecated Crypto Functions
**Vulnerability:** Used deprecated `crypto.createCipher` and `crypto.createDecipher` for AES-256-GCM encryption.
**Learning:** These functions derive keys insecurely using EVP_BytesToKey (MD5) and don't accept explicit initialization vectors (IVs). AES-GCM requires explicit IVs and properly derived keys. The IV should be 12 bytes for GCM.
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv` with explicit, secure keys (like those from scrypt/pbkdf2) and correctly sized random IVs (12 bytes for GCM).
