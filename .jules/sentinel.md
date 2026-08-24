## 2024-03-24 - Deprecated crypto functions crash Node 22
**Vulnerability:** Use of deprecated crypto.createCipher and crypto.createDecipher with GCM algorithm
**Learning:** Node 22 completely removes these functions, causing a crash at runtime. Also, aes-256-gcm requires exactly a 12-byte IV for the standard secure implementation.
**Prevention:** Always use createCipheriv/createDecipheriv and verify IV length requirements for specific block cipher modes.
