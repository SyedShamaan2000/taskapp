# Task 7: Structured API errors + frontend surfacing

## Purpose
Validation and many API failures return opaque messages (e.g. `"Invalid request data"`), so users and developers cannot tell what went wrong. Frontend `getApiErrorMessage` only reads a single top-level string.

## Requirements
- Validation middleware returns a stable envelope: `{ success: false, message, errors?: [{ field, message }] }`.
- Controllers/routes use the same envelope for 4xx where practical.
- Never expose stack traces or DB internals to clients.
- Upgrade frontend helpers to consume `errors[]` and map onto auth / task forms where useful.
- Cover CSRF, 429, network, and auth failure copy.

## Scope
- **In scope:** `backend/middleware/validate.js`, key controllers/routes, `frontend/src/lib/api.ts`, auth + tasks error UI.
- **Out of scope:** New product features; full observability stack (Sentry) unless already planned.

## Notes
- Depends on / pairs well with Task 6 (so create failures become actionable).
- Confirm with product: full field list vs summary + details array (see open questions in `taskapp-improvements.md`).
