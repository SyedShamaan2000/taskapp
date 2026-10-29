# Task 6: Align task API with data model (fix create / update)

## Purpose
After Task 4 (rich Task schema) and Task 5 (new frontend), users can register, verify, and log in, but **cannot create tasks**. Routes and Joi validators still assume the legacy `{ title, description, completed }` shape while the model and UI use `status`, `priority`, `tags`, and related fields.

## Requirements
- Update Joi `taskSchema`, `taskUpdateSchema`, and `taskQuerySchema` to match `backend/models/Task.js`.
- Update `POST /tasks` and `PUT /tasks/:id` handlers to persist validated new fields.
- Fix list filtering that still queries non-existent `completed` (map to `status` or agreed API shape).
- Expand sort allowlist for real fields (`priority`, `status`, `dueDate`, etc. as agreed).
- Keep frontend payloads in sync with the final contract.
- Return useful validation errors once Task 7 lands; for Task 6 at minimum create must succeed with a valid payload.
- Manually verify: create → list → toggle complete → edit → delete.

## Scope
- **In scope:** Backend validators + task routes; frontend create/update/toggle payloads if contract changes; short notes in `development.md` / this file.
- **Out of scope:** Strong passwords (Task 8); full structured error redesign (Task 7) beyond whatever is needed to debug create; new task features (subtasks, drag-and-drop).

## Notes
- Likely immediate failure mode today: Joi rejects unknown `priority` / `tags` → 400 `"Invalid request data"`.
- Open decision: keep API `completed` boolean (synced with `status`) vs status-only. Confirm before coding.
- Do not implement until this plan is confirmed; work on a feature branch off `main`, not on `main`.
