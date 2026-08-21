## 2024-05-15 - Upgrade deprecated crypto functions
**Vulnerability:** Use of deprecated crypto.createCipher and crypto.createDecipher which crash in Node 22+.
**Learning:** Deprecated cryptographic functions may be entirely removed in newer Node environments, leading to complete application crashes rather than just warnings. Also, aes-256-gcm requires a 12-byte IV for standard security.
**Prevention:** Always use createCipheriv with an explicitly generated IV of the correct length for the chosen algorithm.
