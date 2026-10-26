# Development Log — TaskApp Engineering Improvements

Working through `taskapp-improvements.md` one task at a time. One git branch per task.

---

## 2025-10-27 — Start Backend: Authentication & Session Management (Task 1)
- Branch: `feature/auth-jwt-session`
- Goal: Implement JWT-based auth with access/refresh tokens, token refresh mechanism, "remember me", proper session invalidation on logout, auth middleware, and move user context out of localStorage (Redux/Context).
- Status: In progress — branch created, docs started.
- Files yet to modify (planned): backend/routes/auth.js, backend/middleware/auth.js, backend/utils/jwt.js, backend/models/User.js (add refresh token fields?), frontend/src/context or Redux store.
