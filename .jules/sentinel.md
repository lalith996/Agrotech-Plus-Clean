## 2023-10-24 - CSRF Hardcoded Secret Key vulnerability
**Vulnerability:** Found a hardcoded secret key in `lib/security.ts` for CSRF token generation.
**Learning:** Hardcoded secret keys are a critical vulnerability.
**Prevention:** Remove fallback logic and throw an error when secrets are missing.
