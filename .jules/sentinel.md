## 2026-08-18 - Deprecated crypto.createCipher usage
**Vulnerability:** The codebase uses `crypto.createCipher` and `crypto.createDecipher` for encryption, which are deprecated and completely removed in Node 22+.
**Learning:** The previous implementation failed to run on newer Node versions and had fundamental security issues since `createCipher` treats keys as passwords and derives them differently.
**Prevention:** Always use `crypto.createCipheriv` and `crypto.createDecipheriv` with a securely generated IV, particularly a 12-byte IV for GCM mode.
