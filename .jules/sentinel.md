## 2024-05-24 - Deprecated Node.js Crypto APIs
**Vulnerability:** The codebase uses `crypto.createCipher` and `crypto.createDecipher`, which have been deprecated in Node.js and entirely removed in Node 22+.
**Learning:** These methods depend on legacy MD5 key derivation which is insecure, and will outright crash in modern Node.js environments (v22+) leading to severe Denial of Service.
**Prevention:** Always use modern authenticated encryption variants like `crypto.createCipheriv` and `crypto.createDecipheriv`, passing the initialization vector (IV) directly.
