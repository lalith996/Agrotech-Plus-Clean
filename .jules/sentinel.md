## 2024-05-15 - Replace Insecure Crypto Functions
**Vulnerability:** The codebase uses `crypto.createCipher` and `crypto.createDecipher` which are deprecated and rely on weak MD5-based key derivation (`EVP_BytesToKey`). In modern node implementations they are also unsafe and non-functional without proper IV usage.
**Learning:** Legacy cryptographic functions are often left in utility libraries. They must be aggressively updated to their secure counterparts (e.g., `createCipheriv`).
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv` with a secure algorithm (like `aes-256-gcm`) and randomly generated Initialization Vectors (IVs).
