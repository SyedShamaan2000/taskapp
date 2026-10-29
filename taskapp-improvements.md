# TaskApp Engineering Improvements

Living backlog for TaskTrackr. Prefer fixing broken core flows before polishing.

**Status key:** `done` · `broken` · `partial` · `todo`

---

## What’s already done (Tasks 1–5)

| Area | Status | Notes |
|------|--------|-------|
| JWT access + refresh auth | `done` | Backend middleware + frontend Zustand + silent refresh |
| REST task list (`GET /tasks`) | `done` | Pagination / sort / filter query params exist |
| Security: rate limit, CSRF, sanitize, Helmet CSP, Joi | `done` | Validation messages still too generic (see below) |
| Task model: status, priority, dueDate, tags, timestamps | `done` | Model updated; **routes/validators not fully aligned** |
| Frontend rebuild (Vite + TS + TanStack Query + TaskTrackr UI) | `done` | Auth flow works; **task create/update broken against API** |

---

## Priority 0 — Broken: cannot create tasks

**Status (2026-10-30):** Implementing on `fix/align-task-api` — **status-only** contract confirmed (drop `completed`).

**User report:** Register → verify → login works; creating a task fails.

### Root cause (confirmed by code review)

After Task 4 (data modeling), the **Task mongoose schema** uses `status`, `priority`, `dueDate`, `tags` and **no longer has `completed`**. The **frontend** (Task 5) correctly sends the new shape. The **task routes + Joi schemas** still assume the old shape.

| Layer | What it does today | Problem |
|-------|--------------------|---------|
| Frontend `CreateTaskInput` / `TasksPage` | `POST /tasks` with `{ title, description, priority, tags, completed }` | Sends fields Joi does not allow |
| `backend/utils/validators.js` → `taskSchema` | Only allows `title`, `description`, `completed?`, `userId?` | Unknown keys (`priority`, `tags`, …) fail validation → **400 `"Invalid request data"`** |
| `POST /tasks` handler | Creates with `{ title, description, completed, userId }` | Ignores `priority` / `tags` / `status`; writes obsolete `completed` |
| Task model | `status`, `priority`, `dueDate`, `tags` (no `completed`) | Drift vs routes + list filters |
| `taskUpdateSchema` | Only `title`, `description`, `completed` + `.unknown(false)` | Toggle/edit sending `status` / `priority` also fails |
| `GET /tasks` filter | `filter.completed = …` | Field does not exist on model; completed filter is ineffective |
| Query `sort` allowlist | `createdAt\|title\|completed` | Cannot sort by `priority`, `status`, `dueDate` |

### Fix scope (when implementing)

1. Align Joi `taskSchema` / `taskUpdateSchema` / `taskQuerySchema` with the Task model (`status`, `priority`, `dueDate`, `tags`; decide whether to keep a derived `completed` for API convenience or drop it).
2. Update `POST /tasks` and `PUT /tasks/:id` to persist the new fields from validated body.
3. Map list filters: prefer `status` (and optionally derive `completed === status === 'completed'` if the UI keeps a boolean).
4. Expand sort allowlist to match real fields.
5. Ensure frontend payloads match the final API contract (one source of truth in shared types / docs).
6. Manual verify: create → list → toggle complete → edit → delete.

**Suggested next task file:** `tasks/task6.md` — “Align task API with data model + fix create/update”.

---

## Priority 1 — Error handling (backend + frontend)

**Status:** `partial` — errors exist, but users often see opaque messages and field-level guidance is missing.

### Backend gaps

| Issue | Current behavior | Desired |
|-------|------------------|---------|
| Joi `validate` middleware | Always returns `"Invalid request data"` with **no field details** | Return structured `errors: [{ field, message }]` (safe, client-facing). Keep internal logs separate. |
| Controllers | Mix of specific messages and generic 500s | Consistent `{ success, message, errors? }` shape everywhere |
| Auth / verification | Mostly good specific messages | Keep; ensure frontend maps them |
| Task routes | Generic 500 `"Internal server error"` | Same envelope; log real cause server-side |
| Password / validation failures | Opaque or mismatched vs UI rules | Field-level messages that match strong-password rules |

### Frontend gaps

| Issue | Current behavior | Desired |
|-------|------------------|---------|
| `getApiErrorMessage` | Reads only top-level `message` / `error` | Also surface `errors[]` (join or per-field) |
| Auth pages | Inline banners + toast | Map API field errors onto inputs where possible |
| Tasks page | Toast on mutation failure | Same; for create, show why (e.g. validation) not a vague string |
| Network / CSRF / 429 | Partially handled | Clear copy for offline, CSRF retry failure, rate limit |
| Error boundary | Mentioned in task5 scope | Confirm present for render crashes |

### Fix scope (when implementing)

1. Extend validation middleware to return field-level Joi messages.
2. Standardize API error JSON contract.
3. Upgrade `getApiErrorMessage` (+ optional `getApiFieldErrors`).
4. Wire field errors into Register / Login / task form.
5. Smoke-test failure paths: bad OTP, weak password, invalid task body, expired token, CSRF miss.

**Suggested task file:** `tasks/task7.md` — “Structured API errors + FE surfacing”.

---

## Priority 1 — Strong password policy

**Status:** `todo` / inconsistent today.

| Layer | Current rule |
|-------|----------------|
| Frontend register | Min **8** characters only |
| Backend Joi `password` | Min **6**, max 128 — **no complexity** |
| UX | No strength meter / requirement checklist |

### Proposed policy (confirm before coding)

- Minimum **8** characters (align FE + BE; raise BE from 6 → 8).
- At least one **uppercase**, one **lowercase**, one **digit**.
- At least one **special** character from a defined set (e.g. `!@#$%^&*()_+-=[]{}|;:',.<>/?`).
- Max length **128** (already).
- Reject common passwords optionally later (not required for first pass).
- Same rules applied on: register (and future password-change / reset if added).
- Clear user-facing messages: e.g. “Password must be at least 8 characters and include upper, lower, number, and a symbol.”
- Optional UX: live checklist under the password field (does not replace server validation).

**Suggested task file:** `tasks/task8.md` — “Strong password validation (FE + BE)”.

---

## Priority 2 — Remaining product / engineering gaps

Carry-forward items that are still useful after P0/P1. Do not block task create or error/password work.

### API & domain

- [ ] Document final task API contract (OpenAPI or short markdown) after P0 alignment.
- [ ] Health check endpoint (`GET /health`) for deploys.
- [ ] Decide fate of `User.tasks[]` array vs querying by `userId` only (dual write is fragile).

### Auth & account

- [ ] Forgot-password / reset flow (UI link exists on login; backend may be missing).
- [ ] Email change with re-verification.
- [ ] OTP expiry UX already partially done; harden server-side expiry messages.

### Frontend UX

- [ ] Confirm ErrorBoundary coverage.
- [ ] Reduce remaining design debt only after core flows are solid.
- [ ] Accessibility pass (ARIA, focus, contrast) as a dedicated pass.

### Quality & ops

- [ ] Backend unit/integration tests for task create/update validators and routes.
- [ ] Frontend tests for auth forms + create-task mutation error paths.
- [ ] CI already has some frontend check; extend for backend tests.
- [ ] Docker / env validation at startup (as needed for deploy).

### Security (post-P0)

- [ ] Ensure production CSRF secret and `ALLOWED_ORIGINS` are documented in `.env.example`.
- [ ] Hide stack traces always (already mostly true); never leak Joi internals beyond field messages.

---

## Recommended implementation order

1. **Task 6 — Fix task create/update/list alignment** (unblocks the app).
2. **Task 7 — Structured errors FE + BE** (so failures are diagnosable and user-friendly).
3. **Task 8 — Strong passwords** (security + consistent FE/BE rules).
4. Then pick from Priority 2 as needed.

Do **not** start coding these until the corresponding task file is written and the approach is confirmed (especially password policy).

---

## Open questions

1. **`completed` vs `status`:** ~~Decide API shape~~ → **Resolved: status-only** (no `completed` boolean).
2. **Password policy:** OK with the proposed 8+ / upper / lower / digit / special rules, or different requirements (e.g. length-only 12+, or NIST-style “long passphrase, no complexity”)? *(confirm before Task 8)*
3. **Error detail level:** Return all Joi field messages to the client, or a single summary message plus optional `errors` array? *(confirm before Task 7)*

---

*Updated 2026-10-30 after auth-success / task-create-failure report and code review of model vs validators vs frontend payloads.*
