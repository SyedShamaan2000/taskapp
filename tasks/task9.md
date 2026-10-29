# Task 9: Fix browser reload auth error & Vite proxy collision

## Purpose
After logging into the application successfully, refreshing the browser while on `/tasks` resulted in a raw 401 JSON error:
```json
{
  "success": false,
  "message": "Authentication required: access token missing"
}
```
This occurred due to two factors:
1. **Vite dev server proxy collision:** Vite's proxy for `/tasks` blindly intercepted browser HTML page reload requests (`Accept: text/html`) and forwarded them directly to Express (`GET /tasks`), which failed authentication because page reloads do not carry `Authorization: Bearer` headers.
2. **Access token volatility:** `authStore.ts` stored only `refreshToken` and user metadata in `localStorage`, keeping `accessToken` strictly in memory. When the page reloaded, the in-memory access token was wiped, leaving the SPA in an unauthenticated initial state until a 401 retry cycle completed.

## Requirements
- **Vite Proxy Bypass:**
  - Configure `frontend/vite.config.ts` so proxy entries (specifically `/tasks`, `/auth`, `/verify`) check `req.headers.accept`.
  - When a request specifies `Accept: text/html`, bypass proxying and serve `/index.html` so the SPA router handles page rendering.
- **Access Token Persistence in Store:**
  - Update `frontend/src/store/authStore.ts` to persist `accessToken` in `localStorage` under `tasktrackr_access_token`.
  - Save `accessToken` upon `login()` and `setAccessToken()`.
  - Restore `accessToken` and set `isAuthenticated: true` inside `initialize()`.
  - Clear `accessToken` on `logout()`.
- **Seamless Refresh Interceptor Synchronization:**
  - Ensure `frontend/src/lib/api.ts` transparently updates the store and persisted storage when tokens are silently rotated.
- **Verification:**
  - `npm run build` (`tsc && vite build`) passes with zero TypeScript errors.
  - Test browser reload navigation simulation and verify it serves `/index.html` for HTML requests and forwards API requests with Bearer tokens.

## Scope
- **In scope:** `frontend/vite.config.ts`, `frontend/src/store/authStore.ts`, `frontend/src/lib/api.ts`, `tasks/task9.md`, `development.md`.
- **Out of scope:** Backend auth/JWT changes (the backend JWT & refresh mechanism is functioning properly).

## Notes
- By fixing the Vite proxy bypass, client routes sharing names with backend API routes (like `/tasks`) cleanly serve the SPA on reload without colliding with REST endpoints.
