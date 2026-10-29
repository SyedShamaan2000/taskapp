---
description: Core operating rules for the local coding agent
---

# Agent Rules

## 1. Git & Permissions

- **No Direct Changes to `main`:** No changes should be directly made to the `main` branch. Always create a new branch first before making any changes.
- Never run `git` commands (commit, push, merge, rebase, reset --hard, checkout on shared branches, etc.) without explicit user confirmation for that specific action.
- Do not auto-commit or auto-push as a side effect of a task. Propose the commit message and wait for a go-ahead.
- **Small, incremental commits:** Don't pile up a large batch of unrelated changes and push them all at once. After each logical unit of work, propose a focused commit so history stays readable and reviewable.
- Destructive git operations (force push, hard reset, branch deletion) require an explicit, separate confirmation — don't bundle them into a "yes" for something else.

## 2. Coding Best Practices

- Follow idiomatic best practices for the language in use (readable naming, small functions, DRY, proper error handling).
- **Python specifically:**
  - Use `pydantic` classes (`BaseModel`) for data validation/schemas instead of raw dicts or dataclasses when the data crosses a boundary (API input/output, config, DB models).
  - Type-hint all function signatures.
  - Prefer explicit exceptions over silent failures.
  - use logs instead of print statements with different log levels (info, warning, error) for better observability.
- Handle Edge-cases(if not, empty values, nulls, unexpected types) gracefully and explicitly.
- Write tests for new logic where practical, not just the happy path.
- Comments are must.
- Avoid premature optimization; prioritize clarity first, then performance if there's a measured need.

## 3. Project & File Structure

Every project should have a clean, conventional structure, including:

- `README.md` — what the project does, how to set it up, how to run it.
- `.gitignore` — appropriate for the stack in use.
- `.env.example` (never commit a real `.env` with secrets).
- `Dockerfile` / `docker-compose.yml` where containerization is relevant.
- Logical source layout (e.g. `src/`, `tests/`, `docs/`) — don't dump everything at root.
- Any config files (linting, formatting, CI) placed at their conventional locations.

## 4. Plan Before Code

- Before writing code for a non-trivial task, produce a short roadmap/plan first: what will change, in what order, and why.
- If requirements are ambiguous or incomplete, **ask clarifying questions** instead of guessing and proceeding.
- Don't start implementation until the plan (or the answers to open questions) has been confirmed.

## 5. Task Documentation & Progress Tracking

- For every task, create/update a `tasks/` folder in the project with sequentially numbered files: `task1.md`, `task2.md`, etc.
- Each task file must include:
  - **Purpose** — why this change is needed.
  - **Requirements** — what specifically needs to change.
  - **Scope** — what's explicitly in/out of scope.
  - **Notes** — any decisions, trade-offs, or follow-ups.
- Task files are written _before_ or alongside the implementation, not as an afterthought.
- **Keep `development.md` Updated:** Continuously update and append to `development.md` as development progresses, logging branch information, goals, what was changed/modified, files touched, and verification results — so there is an ongoing track of project progress.