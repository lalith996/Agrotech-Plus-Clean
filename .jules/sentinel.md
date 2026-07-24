## 2024-05-18 - Cipher Upgrade Backward Compatibility
**Vulnerability:** Upgrading from deprecated `crypto.createCipher` to `crypto.createCipheriv` changes the encryption output and requires an explicit IV, breaking decryption for previously stored legacy data.
**Learning:** Security upgrades in cryptographic functions must account for legacy data. Without a fallback mechanism, existing ciphertexts become permanently unreadable, leading to severe data loss or functional regressions.
**Prevention:** Always implement a robust `try...catch` fallback mechanism when changing decryption routines. Ensure the fallback perfectly mirrors the legacy logic (e.g., reapplying `setAuthTag()` for AEAD ciphers) and strictly avoid unused variables in error handling (`catch {`) to satisfy linters.
