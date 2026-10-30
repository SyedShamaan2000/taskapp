# Task 10: Prettier & ESLint Code Quality CI and Pre-Commit Hooks

## Purpose

Currently, neither the frontend nor backend has automated linting or formatting tools (ESLint, Prettier). Code formatting and style checks are not verified in GitHub Actions CI, and developers have no git pre-commit hooks to prevent formatting errors or lint warnings from being committed.

This task sets up:

1. Modern ESLint and Prettier configurations for both `frontend` (React + TypeScript) and `backend` (Express.js + CommonJS).
2. GitHub Actions CI workflow (`.github/workflows/code-quality.yml`) that verifies formatting and linting on pull requests and pushes to `main`.
3. Local pre-commit automation using Husky and lint-staged at the repository root to automatically format and lint staged files before commits.

## Requirements

- **Frontend Quality Tooling:**
  - Install ESLint, Prettier, TypeScript-ESLint, and React plugins in `frontend/package.json`.
  - Add configuration files: `frontend/eslint.config.js`, `frontend/.prettierrc`, `frontend/.prettierignore`.
  - Add npm scripts to `frontend/package.json`: `lint`, `lint:fix`, `format`, `format:check`.
- **Backend Quality Tooling:**
  - Install ESLint, Prettier, and Node globals in `backend/package.json`.
  - Add configuration files: `backend/eslint.config.js` (or `.eslintrc.js`), `backend/.prettierrc`, `backend/.prettierignore`.
  - Add npm scripts to `backend/package.json`: `lint`, `lint:fix`, `format`, `format:check`.
- **Pre-commit Automation (Husky + lint-staged):**
  - Add root configuration to support Git hooks via Husky and staged file checks via `lint-staged`.
  - Ensure Husky pre-commit hook runs lint-staged on committed frontend/backend files.
- **GitHub Actions CI:**
  - Create `.github/workflows/code-quality.yml`.
  - Run formatting checks (`format:check`) and lint checks (`lint`) for both backend and frontend on push and pull requests to `main`.
- **Verification:**
  - Run `npm run lint` and `npm run format:check` on both backend and frontend to verify they pass cleanly.
  - Verify existing CI build (`node.js.yml` and frontend `npm run build`) continues to pass without regressions.
  - Verify local git pre-commit hook triggers properly.

## Scope

- **In scope:**
  - `frontend/package.json`, `frontend/eslint.config.js`, `frontend/.prettierrc`, `frontend/.prettierignore`
  - `backend/package.json`, `backend/eslint.config.js`, `backend/.prettierrc`, `backend/.prettierignore`
  - Root `package.json`, `.husky/`, lint-staged configuration
  - `.github/workflows/code-quality.yml`
  - Existing files formatted/linted cleanly to establish a baseline
  - `tasks/task10.md`, `development.md`
- **Out of scope:**
  - Changing runtime application logic or altering API schemas.

## Notes

- Node version in current local environment is `v18.19.1` and CI tests against `22.x` and `24.x`. Dependencies and configs will ensure compatibility across Node 18+ through 24+.
