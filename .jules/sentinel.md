## 2024-05-15 - Deprecated Crypto Fallback Impossible
**Vulnerability:** Use of deprecated crypto.createCipher and crypto.createDecipher with aes-256-gcm.
**Learning:** In Node 22+, createCipher and createDecipher are removed or throw native errors for AEAD modes like aes-256-gcm, and they derive keys differently than createCipheriv (MD5 vs raw key), making a backward-compatibility fallback impossible.
**Prevention:** Always use createCipheriv and createDecipheriv with standard IV lengths (12 bytes for GCM).
