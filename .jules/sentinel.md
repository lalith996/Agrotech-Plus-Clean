## 2024-08-07 - Fix deprecated crypto cipher

**Vulnerability:** Used deprecated and insecure `crypto.createCipher` and `crypto.createDecipher` functions.
**Learning:** Legacy Node.js crypto functions like `createCipher` derive keys using MD5 and crash in newer Node versions with AEAD algorithms like AES-GCM.
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv` with a proper Initialization Vector (IV).
