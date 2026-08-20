## 2024-05-24 - Upgraded Deprecated Cryptographic Functions
**Vulnerability:** The application used deprecated `crypto.createCipher` and `crypto.createDecipher` functions for encryption and decryption, which are less secure, lack proper initialization vector (IV) handling, and are removed in Node 22+.
**Learning:** Legacy cryptographic functions are often maintained for backwards compatibility but can introduce severe security vulnerabilities and runtime errors in newer environments.
**Prevention:** Always use the `iv` variants of cryptographic functions (e.g., `crypto.createCipheriv`) with proper initialization vectors, especially when using authenticated encryption modes like `aes-256-gcm`.
