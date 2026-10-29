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
- Fix applied: removed duplicate `UserSchema.index({ email: 1 })` from `backend/models/User.js` (conflict with `unique: true`).
---

## 2025-10-30 — Task 5: Frontend Rebuild with TypeScript + Vite

- Branch: `feature/rebuild-frontend`
- Goal: Complete frontend rebuild following the PRD in `plan-ui.md` with tranquil aesthetic, TypeScript + Vite, and proper state management.
- Documentation: Established `tasks/` directory with `task1.md`, `task2.md`, `task3.md`, `task4.md`, and `task5.md` complying with `agent-rule.md`.

### Background
The current frontend is built with Create React App (JavaScript) and uses:
- `window.location.reload()` after every operation (poor state management)
- localStorage for auth state
- Basic styling with minimal design system
- POST /tasks/fetch (backend uses GET /tasks now)

### Requirements
- Use **TypeScript + Vite** for faster builds and better tooling
- Implement **TanStack Query** for server state management (replaces manual axios calls)
- Implement **React Router v6** for client-side routing
- Implement **Zustand** for lightweight client state (auth tokens, user session)
- Follow the **TaskTrackr PRD** aesthetic: warm cream background (`#FAF6EE`), terracotta accent (`#B8643C`), sage success (`#7D8F6B`), editorial typography (Newsreader + Plus Jakarta Sans)
- Implement full auth flow: Register → OTP verification → Login → Tasks workspace
- Implement task CRUD with pagination, sorting, filtering, and optimistic updates
- Add proper routing protection and 404 fallback
- Responsive design for mobile and desktop
- WCAG AA accessibility compliance

### Files Planned for Creation
- `frontend/package.json` — Vite, React 18, TypeScript, TanStack Query, Zustand, Axios, Lucide React
- `frontend/vite.config.ts` — Vite config with dev proxy to `http://localhost:3000`
- `frontend/tsconfig.json` & `frontend/tsconfig.node.json` — TypeScript configuration
- `frontend/index.html` — HTML entry point with Google Fonts (*Newsreader* & *Plus Jakarta Sans*)
- `frontend/src/index.css` — Tranquil TaskTrackr design system and tokens
- `frontend/src/types/index.ts` — Domain and API schemas
- `frontend/src/lib/api.ts` — Axios client with CSRF token handshake and silent JWT refresh interceptor
- `frontend/src/store/authStore.ts` — Zustand authentication store
- `frontend/src/components/ui/` — Button, Input, Card, Checkbox, Badge, Toast, Modal, Skeleton
- `frontend/src/pages/` — Register, VerifyOtp, Login, Tasks, NotFound
- `frontend/src/App.tsx` & `frontend/src/main.tsx` — Routing, QueryClientProvider, and ProtectedRoute

### Staged Implementation Milestones
1. **Milestone 1 — Project Scaffold & Design System:**
   - Scaffold `frontend/` directory with Vite, TypeScript, dependencies, dev proxy to backend.
   - Setup `index.html` with fonts and `src/index.css` containing complete TaskTrackr design system tokens.
   - Proposed Commit 1: `feat(frontend): scaffold TypeScript Vite app with TaskTrackr design tokens`
2. **Milestone 2 — API Client, Interceptors & State Management:**
   - Implement `src/lib/api.ts` with CSRF handling and silent JWT refresh on 401.
   - Implement `src/store/authStore.ts` with Zustand.
   - Setup TanStack Query `QueryClientProvider` and TypeScript types.
   - Proposed Commit 2: `feat(frontend): add API client with CSRF and JWT refresh, auth store, and types`
3. **Milestone 3 — Auth Flow Screens:**
   - Implement `/register` with validation.
   - Implement `/verify-otp` with 6-digit auto-advancing grid, paste handling, and 45s resend timer.
   - Implement `/login` with inline alert banner and unverified redirect.
   - Proposed Commit 3: `feat(frontend): implement registration, OTP verification, and login pages`
4. **Milestone 4 — Daily Tasks Workspace & Components:**
   - Implement `/tasks` workspace: header with edition date, pacing/progress wave indicator, quick-add form, filter/search toolbar, task cards with circular checkboxes, edit/delete actions, completed archive, pagination, empty states, and toast notifications.
   - Protected route wrapper and 404 page.
   - Proposed Commit 4: `feat(frontend): implement tasks workspace, progress widget, filters, and protected routing`
5. **Milestone 5 — Verification & Polish:**
   - Verify TypeScript compilation (`tsc --noEmit`), Vite production build (`npm run build`), and end-to-end responsiveness.
   - Update `development.md` with final verification results.
   - Proposed Commit 5: `docs: update development log with Task 5 completion and verification`

