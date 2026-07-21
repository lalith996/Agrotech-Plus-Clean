## 2024-07-21 - [Deprecated Cryptographic Functions]
**Vulnerability:** Use of deprecated `crypto.createCipher` and `crypto.createDecipher` for `aes-256-gcm` in `lib/security.ts` causing runtime errors and potential security issues because IV wasn't provided correctly to the cipher initialization.
**Learning:** Modern Node.js versions have removed `crypto.createCipher` and `crypto.createDecipher` in favor of `crypto.createCipheriv` and `crypto.createDecipheriv`, which require an initialization vector (IV). This caused a crash when attempting to encrypt or decrypt data.
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv` with a securely generated IV for AES encryption.
