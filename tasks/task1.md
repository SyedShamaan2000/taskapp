# Task 1: Authentication & Session Management

## Purpose
The legacy implementation stored raw user objects in `localStorage` without JWT authentication or session expiry. This task establishes secure, stateless JWT authentication with access and refresh tokens, a token refresh endpoint, and authentication middleware.

## Requirements
- Generate short-lived access tokens (15m) and long-lived refresh tokens (7d) upon successful login.
- Provide secure token verification utility functions (`signAccessToken`, `signRefreshToken`, `verifyAccessToken`, `verifyRefreshToken`).
- Create `authMiddleware` to protect private endpoints via `Bearer` token header verification.
- Provide a dedicated `/auth/refresh` endpoint to exchange valid refresh tokens for new access tokens.
- Add configuration for JWT secrets and expiries in `.env`.

## Scope
- **In Scope:**
  - `backend/utils/jwt.js` for token signing and verification.
  - `backend/middleware/authMiddleware.js` for verifying Bearer access tokens.
  - `backend/controllers/loginController.js` to return access and refresh tokens.
  - `backend/routes/userRoutes.js` for `/auth/refresh` route.
- **Out of Scope:**
  - Frontend token storage and interceptors (deferred to Task 5).
  - OAuth or third-party identity providers.

## Notes
- Access token expiry set to 15 minutes; refresh token expiry set to 7 days.
- Secrets are configured via `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in environment variables.
