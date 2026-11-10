## 2024-03-24 - Replace deprecated crypto.createCipher and crypto.createDecipher with crypto.createCipheriv and crypto.createDecipheriv
**Vulnerability:** Node.js crypto.createCipher function used with authenticated modes like AES-GCM introduces a critical vulnerability by deterministically deriving the IV from the key, resulting in GCM nonce reuse.
**Learning:** Legacy node features have vulnerabilities, they need to be replaced. createDecipheriv needs to fallback to createDecipher using try/catch to support older encrypted data.
**Prevention:** Avoid crypto.createCipher and crypto.createDecipher in new code, always use the iv versions.
