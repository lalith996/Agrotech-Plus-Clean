## 2024-05-18 - Deprecated cryptographic functions

**Vulnerability:** Usage of deprecated `crypto.createCipher` and `crypto.createDecipher` which derive keys insecurely (MD5) and do not use initialization vectors securely.
**Learning:** Legacy encryption methods like `crypto.createCipher` are completely removed in newer versions of Node.js (e.g., Node 22+) for AEAD modes like `aes-256-gcm`, making backward-compatible fallbacks impossible.
**Prevention:** Always use modern, standard encryption methods like `crypto.createCipheriv` and `crypto.createDecipheriv` with a secure Key Derivation Function (KDF) like `scryptSync` and an explicitly generated Initialization Vector (IV).
