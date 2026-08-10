## 2024-05-24 - Fix deprecated crypto.createCipher
**Vulnerability:** Used deprecated `crypto.createCipher` and `crypto.createDecipher` functions, which rely on weak key derivation and are removed in Node 22+.
**Learning:** `createCipher` and `createDecipher` are insecure and broken in newer Node versions.
**Prevention:** Always use `createCipheriv` and `createDecipheriv` with a proper IV (12 bytes for GCM mode).
