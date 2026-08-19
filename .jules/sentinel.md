## 2026-08-19 - Deprecated Crypto Functions
**Vulnerability:** The use of `crypto.createCipher` and `crypto.createDecipher` instead of `crypto.createCipheriv` and `crypto.createDecipheriv`
**Learning:** These legacy functions use an insecure MD5-based key derivation (EVP_BytesToKey) and lack a proper Initialization Vector (IV), making them highly susceptible to dictionary and brute-force attacks. They have been deprecated in modern Node.js versions and are strictly unsupported for AEAD algorithms like AES-GCM.
**Prevention:** Always use `createCipheriv` and `createDecipheriv` with explicitly generated Initialization Vectors (e.g., 12 bytes for GCM) and strong, fixed-length keys.
