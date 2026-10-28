# Development Log — TaskApp Engineering Improvements

Working through `taskapp-improvements.md` one task at a time. One git branch per task.

---

## 2025-10-27 — Start Backend: Authentication & Session Management (Task 1)

- Branch: `feature/auth-jwt-session`
- Goal: Implement JWT-based auth with access/refresh tokens, token refresh mechanism, "remember me", proper session invalidation on logout, auth middleware, and move user context out of localStorage (Redux/Context).
- Status: In progress — branch created, docs started.
- Files yet to modify (planned): backend/routes/auth.js, backend/middleware/auth.js, backend/utils/jwt.js, backend/models/User.js (add refresh token fields?), frontend/src/context or Redux store.
- Changes made so far: created `development.md`; created git branch `feature/auth-jwt-session`; committed doc file.

- Fix: authMiddleware.js was emptied by edit tool; rebuilt with JWT Bearer verification (47 lines).
- Added: backend/utils/jwt.js (sign/verify access + refresh tokens).
- Updated: .env with JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, expiries.
- Still needed for Task 1: loginController (return tokens), refresh endpoint, User model refreshToken, logout invalidation.

- Updated loginController: imports jwt utils; generates accessToken + refreshToken; returns both in response.
- Files changed: controllers/loginController.js, middleware/authMiddleware.js, utils/jwt.js, .env, development.md.

---

## 2025-10-27 — Backend: RESTful API Design (Task 2)

- Branch: `feature/restful-api-design`
- Goal: Replace POST /tasks/fetch with GET /tasks; add pagination (?page=1&limit=10), sorting, filtering; fix PUT create vs POST create.
- Changes made: added refresh endpoint on auth branch; committed; switched branch.

- Fix: replaced POST /tasks/fetch with GET /tasks in taskRoutes.js; userId now from req.user (auth middleware); added pagination (?page, ?limit), sorting (?sort), filtering (?completed, ?priority, ?search) query support; fixed response codes.
- Files changed: backend/routes/taskRoutes.js, development.md.
- Updated: backend/routes/taskRoutes.js — POST /fetch replaced with GET /tasks; pagination/sorting/filtering added; uses req.user from auth middleware; other routes preserved.

---

## 2025-10-27 — Backend: Security Enhancements (Task 3)

- Branch: `feature/security-enhancements`
- Goal: Add rate limiting, CSRF protection, sanitize inputs, CSP headers, hide error details, add input validation (Joi/Zod), proper CORS with env-based origins.
- Status: Backend implementation complete; frontend must fetch `/csrf-token` and send state-changing requests with credentials, including the returned `CSRF-Token` header.
- Added and wired auth/API rate limits, signed double-submit-cookie CSRF protection, recursive XSS sanitization, CSP/security headers, and environment-based CORS allowlisting.
- Added Joi schemas and request validation for authentication, verification, task CRUD, task filters, and task IDs. Task updates/deletes are scoped to the authenticated owner; client error responses no longer expose database error details.
- Added `TRUST_PROXY_HOPS` configuration for deployments behind a trusted reverse proxy. Set `ALLOWED_ORIGINS` as a comma-separated list.
- Dependencies: `express-rate-limit`, `xss`, and `joi`. CSRF tokens use Node's built-in crypto module; production requires a 32-byte-or-longer `CSRF_SECRET`.
- Validation: backend JavaScript syntax checks and HTTP smoke tests passed (CSRF rejection/token flow, rate limiting, CORS, CSP, malformed JSON, sanitization, and request validation); `npm audit --omit=dev --prefix backend` reports 0 vulnerabilities.

---

## 2025-10-27 — Task 4: Database & Data Modeling

- Branch: `feature/db-data-modeling`
- Goal: Add timestamps, due dates, priorities, categories, status fields, user metadata, and indexes.
- Changes made:
  - Updated `backend/models/Task.js`: replaced `completed` with `status` enum; added `priority`, `dueDate`, `tags`; added `{ timestamps: true }`; added compound indexes on `userId/status/dueDate` and `tags`.
  - Updated `backend/models/User.js`: added `updatedAt`, `lastLogin`, `onlineStatus`; added indexes on `email` and `isVerified`.
- Status: Complete — model updates committed.
