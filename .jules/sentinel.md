## 2025-02-17 - Fix deprecated and vulnerable crypto cipher
**Vulnerability:** Usage of the deprecated crypto.createCipher and crypto.createDecipher functions with aes-256-gcm in DataEncryption class.
**Learning:** Node.js crypto.createCipher is deprecated, insecure (relies on legacy key derivation), and crashes in modern environments (e.g. Node 22). It must be replaced with crypto.createCipheriv which accepts an initialization vector.
**Prevention:** Always use crypto.createCipheriv and crypto.createDecipheriv for secure, deterministic encryption, ensuring proper IV lengths (like 12 bytes for aes-256-gcm).
