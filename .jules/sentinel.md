## 2024-05-24 - Deprecated Encryption Ciphers
**Vulnerability:** The `DataEncryption` utility in `lib/security.ts` uses the deprecated `crypto.createCipher` and `crypto.createDecipher` functions instead of the modern `iv`-requiring variants (`crypto.createCipheriv`). This uses an insecure key derivation function (EVP_BytesToKey) which is a security risk.
**Learning:** Found an older crypto implementation that used a deprecated API without an initialization vector.
**Prevention:** Always use `crypto.createCipheriv` with an explicit initialization vector (IV) for symmetric encryption in Node.js.
