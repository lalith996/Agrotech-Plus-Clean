## 2024-10-07 - Insecure Cryptographic Functions
**Vulnerability:** The codebase was using `crypto.createCipher` and `crypto.createDecipher` in `lib/security.ts`.
**Learning:** `crypto.createCipher` and `crypto.createDecipher` are deprecated and considered insecure because they use weak key derivation functions without salting and implicitly derive both a key and an Initialization Vector (IV) from a password. This makes them vulnerable to dictionary attacks and other cryptanalysis.
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv`, which require explicitly providing a secure, randomly generated IV. This ensures cryptographic operations are robust against known vulnerabilities associated with the older functions.
