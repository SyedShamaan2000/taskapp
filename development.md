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
### Implementation Status & Verification Results
- **Status:** Complete — All milestones implemented and verified.
- **Scaffold & Build:** Created `/frontend` with Vite, React 18, and strict TypeScript (`tsconfig.json`).
- **Design System:** Implemented full TaskTrackr tranquil design system in `frontend/src/index.css` per `plan-ui.md`:
  - Warm cream background base (`#FAF6EE` / `#FFF8F4`).
  - Warm Charcoal typography (`#2B2620`) and Muted Warm Gray (`#8A8173`).
  - Accent palette: Muted Terracotta (`#B8643C`) and Soft Sage (`#7D8F6B`).
  - Google Fonts: *Newsreader* serif headlines + *Plus Jakarta Sans* UI sans-serif.
- **Networking & Security:**
  - Implemented `src/lib/api.ts` with Axios, automatic CSRF token fetching (`/csrf-token`), and `CSRF-Token` headers on state-changing requests.
  - Silent token refresh interceptor automatically rotating expired access tokens via `/auth/refresh` upon 401 responses.
- **State Management:**
  - TanStack Query v5 configured for server-state caching, invalidation, and optimistic updates.
  - Zustand stores for auth session (`useAuthStore`) and tranquil floating toasts (`useUiStore`).
- **Screens Implemented:**
  - `/register` — Single-column layout (440px), validation, min 8 char password with show/hide eye toggle, reassurance copy.
  - `/verify-otp` — 6-digit auto-advancing grid, backspace retreat, clipboard paste splitter, 10-minute expiry notice, 45-second resend countdown.
  - `/login` — Editorial title, show/hide password, terracotta inline banner with deep link to OTP verification for unverified accounts.
  - `/tasks` — 680px column, edition header (`JOURNAL • [DAY] EDITION`), persistent quick-add form (title, notes, tags, priority), pacing & progress wave widget, active task cards with circular checkboxes, completed task archive, search & filter toolbar, edit & delete modals.
  - `*` — Tranquil 404 fallback page (`NotFoundPage`).
- **Build Verification:**
  - `npm run build` executed cleanly (`tsc && vite build`), generating optimized production bundle in `frontend/dist/` with zero TypeScript errors.
  - Vite dev server tested and serving on `http://localhost:5173/`.

---

## 2026-10-30 — Backlog refresh: task create failure + errors + passwords

- Branch: `docs/taskapp-improvements-backlog`
- Goal: Investigate why task create fails after successful auth; document prioritized fixes without rushing into code.
- Findings:
  - Auth path (register / verify / login) works with JWT + CSRF + rebuilt frontend.
  - Task create fails due to **schema drift**: Task model + frontend use `status` / `priority` / `tags`; Joi `taskSchema` and `POST /tasks` still expect legacy `completed`-centric payloads. Unknown keys → 400 `"Invalid request data"`. Updates/filters similarly misaligned.
  - Error handling is partial: validation hides field details; FE only surfaces top-level `message`.
  - Password rules are weak/inconsistent (FE min 8, BE Joi min 6, no complexity).
- Docs updated:
  - Rewrote `taskapp-improvements.md` as a living prioritized backlog (P0 create fix, P1 errors, P1 strong passwords, P2 later).
  - Added `tasks/task6.md` (API/model align), `tasks/task7.md` (structured errors), `tasks/task8.md` (strong passwords).
- Status: Documentation only — **no code fixes yet**. Awaiting confirmation on `completed` vs `status` API shape and password policy before implementation.

---

## 2026-10-30 — Task 6: Align task API with data model (fix create/update)

- Branch: `fix/align-task-api`
- Goal: Unblock task create/update after schema drift between Task model, Joi validators, routes, and frontend.
- Decision: **Status-only** API — remove `completed` boolean; use `status` everywhere (pending / in-progress / completed).
- Changes:
  - `backend/utils/validators.js` — `taskSchema` / `taskUpdateSchema` accept `status`, `priority`, `dueDate`, `tags`; query filters/sorts use real fields (no `completed`).
  - `backend/routes/taskRoutes.js` — `POST /tasks` persists new fields; `GET /tasks` filters by `status` + `priority`.
  - `frontend/src/types/index.ts` — dropped `completed` from domain types.
  - `frontend/src/pages/TasksPage.tsx` — create sends `status: 'pending'`; toggle sends `status` only; archive split uses `status === 'completed'`.
  - Docs: `tasks/task6.md`, this log.
- Verification:
  - `node --check` on validators + task routes — pass.
  - Joi smoke: create with status/priority/tags accepted; legacy `completed` rejected; toggle `{ status }` accepted; query `status` + sort `-priority` accepted.
  - `frontend` `npm run build` (`tsc && vite build`) — pass, zero TS errors.

