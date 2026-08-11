## 2024-05-19 - Deprecated Crypto Functions
**Vulnerability:** Use of deprecated crypto.createCipher and crypto.createDecipher which use weak MD5 key derivation and fail completely in modern Node (v22+).
**Learning:** Legacy crypto methods with AEAD modes cause hard crashes in modern environments, preventing any legacy fallback mechanism.
**Prevention:** Always use createCipheriv/createDecipheriv with explicitly generated keys and properly sized IVs (12 bytes for GCM).
