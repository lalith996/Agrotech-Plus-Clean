## 2024-08-05 - Insecure Crypto Default

**Vulnerability:** Node's `crypto.createCipher()` and `crypto.createDecipher()` are used in `lib/security.ts`. These methods are deprecated, use MD5 (insecure) for key derivation, and fail completely in Node 22+ when used with AEAD algorithms like `aes-256-gcm`.

**Learning:** When generating encryption helpers, legacy APIs like `createCipher` may break abruptly in newer Node environments, causing total functionality failure rather than just raising warnings.

**Prevention:** Always use `crypto.createCipheriv()` and `crypto.createDecipheriv()` with a properly generated, fixed-length key (e.g., using `crypto.scryptSync` as currently done, but extracting the correct key length directly) and a randomly generated Initialization Vector (IV).
