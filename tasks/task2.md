# Task 2: RESTful API Design

## Purpose
The backend used non-standard REST conventions, including `POST /tasks/fetch` for retrieving tasks and lacked pagination, filtering, and sorting capabilities. This task standardizes the task management API into idiomatic RESTful endpoints.

## Requirements
- Replace `POST /tasks/fetch` with standard `GET /tasks`.
- Implement pagination support via `page` (default 1) and `limit` (default 10) query parameters.
- Add sorting capabilities via `sort` parameter (e.g., `-createdAt`, `title`, `completed`).
- Add filtering support for completion status (`completed`), priority (`priority`), and case-insensitive regex search (`search`).
- Return structured pagination metadata: `{ page, limit, total, pages }`.
- Enforce user scoping using authenticated `req.user._id` for all operations.

## Scope
- **In Scope:**
  - `backend/routes/taskRoutes.js` refactoring for `GET /tasks`.
  - Pagination, sorting, and filtering logic using Mongoose query chaining.
- **Out of Scope:**
  - Database schema alterations (covered in Task 4).
  - Frontend API client updates (deferred to Task 5).

## Notes
- Search performs an escaped case-insensitive regex across both `title` and `description`.
- Response format standardized to `{ success: true, tasks: [...], pagination: { ... } }`.
