## 2024-05-18 - Deprecated crypto.createCipher usage
**Vulnerability:** The application used `crypto.createCipher` and `crypto.createDecipher`, which are deprecated and insecure (and throw runtime errors in newer Node.js versions).
**Learning:** `createCipher` derives keys using weak, unauthenticated algorithms and is deprecated. For AES-GCM, an explicit Initialization Vector (IV) is required.
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv` with explicitly generated, random IVs for secure symmetric encryption.
