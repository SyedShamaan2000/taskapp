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
