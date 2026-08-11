## 2024-08-11 - Upgrade deprecated cryptography in DataEncryption
**Vulnerability:** Use of deprecated `crypto.createCipher` and `crypto.createDecipher` which derive keys using MD5 and can be vulnerable to dictionary attacks and lack proper initialization vector requirements.
**Learning:** Legacy cryptographic functions are often deeply embedded in utility classes but pose risks in modern Node.js environments and lack support for AEAD modes properly. Node 22+ restricts them or throws native errors for `aes-256-gcm`.
**Prevention:** Use `crypto.createCipheriv` and `crypto.createDecipheriv` with properly generated and sized initialization vectors.
