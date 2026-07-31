## 2025-02-27 - [Fix Deprecated Crypto Cipher]
**Vulnerability:** Use of deprecated `crypto.createCipher` and `crypto.createDecipher` methods.
**Learning:** Legacy systems might rely on older, less secure cryptographic functions which could be vulnerable to attacks over time. When upgrading, backward compatibility must be maintained carefully using a `try...catch` fallback strategy.
**Prevention:** Regularly audit dependencies and built-in function usage. Utilize secure, modern cryptographic algorithms like AES-GCM with `createCipheriv` and proper initialization vectors (IVs).
