## 2024-05-18 - Deprecated crypto.createCipher in DataEncryption
**Vulnerability:** Used deprecated and insecure `crypto.createCipher` and `crypto.createDecipher` functions in `lib/security.ts`. These functions derive a key from a password without specifying an IV, which is prone to dictionary attacks, and are generally deprecated in favor of `crypto.createCipheriv` and `crypto.createDecipheriv`.
**Learning:** Found usage of deprecated crypto methods. Replaced with `crypto.createCipheriv` and `crypto.createDecipheriv` while passing the generated IV. Also added a fallback in the decryption method to support legacy data encrypted with the older, deprecated method.
**Prevention:** Always use `createCipheriv` and `createDecipheriv` with a properly generated initialization vector (IV).
