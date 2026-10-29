# Task 3: Security Enhancements

## Purpose
Harden the application backend against common web vulnerabilities, including CSRF, XSS, brute-force attacks, injection, and unauthorized data access.

## Requirements
- Add rate limiting using `express-rate-limit` for authentication (`authLimiter`) and general API calls (`apiLimiter`).
- Implement signed double-submit cookie CSRF protection with a dedicated `GET /csrf-token` endpoint.
- Implement recursive HTML/XSS body sanitization using `xss`.
- Configure HTTP security headers and Content Security Policy via `helmet`.
- Enforce strict input validation using `joi` schemas on all auth, verify, and task routes.
- Replace hardcoded CORS origins with environment-based `ALLOWED_ORIGINS` parsing and credentials support.
- Mask internal error details and database exceptions from client responses.

## Scope
- **In Scope:**
  - `backend/middleware/csrf.js` for CSRF token issuance and validation.
  - `backend/middleware/sanitize.js` for recursive input sanitization.
  - `backend/middleware/rateLimit.js` for rate limiting policies.
  - `backend/middleware/validate.js` and `backend/utils/validators.js` for Joi schema validation.
  - `backend/app.js` middleware pipeline wiring and global error masking.
- **Out of Scope:**
  - Frontend CSRF token retrieval handling (implemented in Task 5 client setup).

## Notes
- State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require the `CSRF-Token` header matching the signed cookie.
- Rate limiting is configured for proxies via `TRUST_PROXY_HOPS`.
