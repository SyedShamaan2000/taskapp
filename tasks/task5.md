# Task 5: Frontend Rebuild with TypeScript + Vite

## Purpose
The legacy frontend was a basic Create React App (JavaScript) project that suffered from critical architectural drawbacks: reliance on `window.location.reload()` after every mutation, insecure user management in `localStorage`, lack of TypeScript type safety, absence of CSRF and silent token refresh integration, and a rudimentary visual design.

This task completely rebuilds the frontend as a high-performance, fully-typed Single Page Application using **Vite**, **TypeScript**, **React Router v6**, **TanStack Query v5**, and **Zustand**, implementing the tranquil editorial design system specified in `plan-ui.md` (**TaskTrackr**).

## Requirements

### 1. Tooling & Core Architecture
- Setup Vite with React and TypeScript (`vite.config.ts`, `tsconfig.json`, `package.json`).
- Configure a Vite dev server proxy to forward `/auth`, `/tasks`, `/verify`, and `/csrf-token` to `http://localhost:3000`.
- Load Google Fonts (*Newsreader* serif for editorial headings, *Plus Jakarta Sans* / *Inter* for crisp UI text).

### 2. Networking & State Management
- **Axios HTTP Client (`src/lib/api.ts`):**
  - Configured with `withCredentials: true`.
  - Automatic CSRF handshake: fetches `/csrf-token` on bootstrap and attaches `CSRF-Token` header to state-changing requests (`POST`, `PUT`, `DELETE`).
  - Request interceptor: attaches `Authorization: Bearer <accessToken>`.
  - Response interceptor: automatically intercepts 401 errors, performs silent token renewal via `/auth/refresh`, and retries the original request seamlessly.
- **TanStack Query (`@tanstack/react-query`):**
  - Manages all server state: query caching, optimistic UI updates for task completion and deletion, zero page reloads.
- **Zustand Store (`src/store/authStore.ts`):**
  - Stores authenticated user profile and in-memory access token.
  - Safe persistence for session tokens and clean logout handling.

### 3. TaskTrackr Design System & Aesthetic Language (`src/index.css`)
- **Color Palette:**
  - Background: Warm cream base (`#FAF6EE` / `#FFF8F4`).
  - Containers & Cards: Cream white (`#FFFDF8` / `#FFFFFF`) with 1px architectural delineation (`#E8E0D0` / `#E2D8CF`).
  - Text: Warm charcoal (`#2B2620`) for headings/body; muted warm gray (`#8A8173`) for secondary metadata.
  - Accent: Muted terracotta (`#B8643C`) for primary CTAs; soft sage (`#7D8F6B`) for completed tasks and success states.
- **Micro-interactions:** Smooth 150–200ms ease transitions, tactile circular checkboxes, tranquil wave progress meter.

### 4. Page & Feature Implementation
- **Registration (`/register`):** Name, email, password fields, validation, instant navigation to `/verify-otp`.
- **Email OTP Verification (`/verify-otp`):** 6-slot individual digit grid, auto-focus progression, paste distribution handler, 10-minute expiry notice, and 45-second resend cooldown timer.
- **Authentication / Login (`/login`):** Email and password inputs, inline error banner with deep link to OTP verification if account is unverified.
- **Tasks Workspace (`/tasks`):**
  - Protected route requiring valid authentication.
  - Header: brand mark, journal date edition (`JOURNAL • [DAY] EDITION`), user greeting, and peaceful logout action.
  - Quick-add form docked persistently at the top with title, notes, priority, and tags.
  - Pacing & Progress widget displaying daily focus commitments and percentage cleared.
  - Search, filter (status, priority), and sorting toolbar.
  - Active task list with custom circular checkboxes, category chips, and contextual actions (edit modal, delete confirmation).
  - Completed task archive (collapsible section with softened opacity and strikethroughs).
  - Pagination controls for multi-page task sets.
  - Peaceful empty states and soft skeleton loading cards.
- **Feedback & Notifications:** Toast alert pill for asynchronous actions.
- **Routing & Error Handling:** `NotFoundPage` (404) and `ErrorBoundary`.

## Scope
- **In Scope:**
  - Modern TypeScript Vite project under `/frontend`.
  - Complete TaskTrackr component library and custom editorial CSS design system.
  - End-to-end auth flows (register, OTP verification, login, silent refresh, logout).
  - Full task management CRUD with search, filters, pagination, and optimistic updates.
  - Responsive layout for desktop and mobile screens.
- **Out of Scope:**
  - Third-party OAuth providers (Google/GitHub login).
  - Ambient theme customization (Warm Sand / Morning Tea / Night Ink — deferred to PRD Phase 3).

## Notes
- By using Vite's development proxy, requests are made to same-origin paths, ensuring robust cookie handling for CSRF tokens and avoiding cross-origin security complications.
- All git operations will follow `agent-rule.md` with explicit user confirmation and proposed commit messages.
