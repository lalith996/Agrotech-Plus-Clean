## 2024-05-18 - [Insecure Cryptographic Operations]
**Vulnerability:** Node.js `crypto.createCipher` and `crypto.createDecipher` were used in `DataEncryption` (`lib/security.ts`).
**Learning:** These methods are deprecated because they use insecure key derivation. They derive the encryption key and IV internally using MD5, which is vulnerable to dictionary attacks and does not provide an explicitly secure IV.
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv` with a securely generated IV instead of `createCipher` and `createDecipher`.
