## 2024-08-07 - Deprecated crypto.createCipher in Node 22
**Vulnerability:** Found `crypto.createCipher` used for AES-256-GCM encryption in `lib/security.ts`. `createCipher` is deprecated and derives keys differently (MD5), making it incompatible with raw keys expected by `createCipheriv` and throws an error in Node 22+ for AEAD modes like GCM.
**Learning:** Legacy node crypto methods often break or change semantics in modern Node versions, particularly regarding key derivation and AEAD mode compatibility.
**Prevention:** Always use `createCipheriv` and `createDecipheriv` with explicitly generated IVs and correct raw keys or properly derived keys (e.g., using `scryptSync`) for modern encryption standards.

## 2024-08-07 - crypto.createDecipher not working in Node 22
**Vulnerability:** Found `crypto.createDecipher` used for AES-256-GCM decryption in `lib/security.ts`. `createDecipher` throws an error in Node 22+ for AEAD modes like `aes-256-gcm`.
**Learning:** `createDecipher` cannot be used with AEAD modes in modern Node.js versions, so backward compatibility fallback using it is not possible.
**Prevention:** Migrate entirely to `createDecipheriv` and do not rely on `createDecipher` for legacy support of AEAD ciphers in modern Node.
