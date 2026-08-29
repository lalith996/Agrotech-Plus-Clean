## 2024-05-24 - Insecure crypto.createCipher Usage
**Vulnerability:** The DataEncryption class used the deprecated crypto.createCipher and crypto.createDecipher functions, which are insecure because they derive keys using the weak MD5 hash and lack an explicit Initialization Vector (IV).
**Learning:** Legacy Node.js crypto functions can persist in codebases if not actively audited. They might even crash modern Node.js environments (v22+) since they have been removed.
**Prevention:** Always use crypto.createCipheriv and crypto.createDecipheriv with explicitly generated, cryptographically strong IVs for symmetric encryption.
