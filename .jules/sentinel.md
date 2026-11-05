## 2024-05-24 - [Replace deprecated insecure crypto methods]
**Vulnerability:** Node.js crypto.createCipher and crypto.createDecipher were being used for encryption. These methods use insecure key derivation.
**Learning:** For secure encryption in Node.js, `crypto.createCipheriv` and `crypto.createDecipheriv` should be used instead, explicitly providing a secure Initialization Vector (IV).
**Prevention:** Avoid using deprecated `createCipher` and `createDecipher` functions; enforce linter rules to flag them.
