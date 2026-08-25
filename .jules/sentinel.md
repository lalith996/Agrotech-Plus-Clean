## 2024-05-15 - Deprecated Crypto Ciphers
**Vulnerability:** Usage of deprecated `crypto.createCipher` and `crypto.createDecipher`.
**Learning:** These methods derive keys insecurely (EVP_BytesToKey) and are removed entirely in Node.js 22+.
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv` with a proper, randomly generated IV. For GCM mode (e.g. `aes-256-gcm`), the IV must be exactly 12 bytes long.
