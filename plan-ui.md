# TaskTrackr — Product Requirements Document (PRD) & Product Brief

**Product Name:** TaskTrackr  
**Version:** 1.0  
**Status:** Approved for Implementation  
**Product Vision:** _"A quiet place for your tasks."_ An intentional, tranquil, and distraction-free daily task management tool designed around calm pacing, mindful focus, and restrained editorial aesthetics.

---

## 1. Executive Summary & Problem Statement

### 1.1 The Problem

Modern task management and productivity tools suffer from feature fatigue, aggressive notifications, high-contrast dashboards, gamified stress loops, and artificial urgency. Users feeling overwhelmed by high-velocity work environments need a sanctuary for contemplation, priority focus, and deliberate pacing rather than an adrenaline-fueled ticketing system.

### 1.2 The Solution

**TaskTrackr** strips away invasive alerts, loud gradients, complex kanban boards, and cluttered multi-panel layouts. It provides an unhurried, single-column workspace grounded in warm editorial typography, generous whitespace, muted natural tones, and frictionless single-session task curation.

---

## 2. Core User Personas

- **Eleanor (The Mindful Knowledge Worker & Writer):** Needs a clean space to note down 3–5 core daily intentions without notification badges, noisy project tags, or algorithmic pressure. Values serene visuals and typography.
- **Julian (The Solo Founder / Operator):** Overstimulated by corporate Jira/Slack feeds. Wants a lightweight, fast, distraction-free morning ritual to log essential commitments and check them off quietly.

---

## 3. Product Principles & Aesthetic Language

| Dimension              | Specification                                                                                           | Rationale                                                             |
| :--------------------- | :------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| **Background**         | Warm cream base (`#FAF6EE` / `#FFF8F4`)                                                                 | Eliminates stark optical glare; evokes tactile notebook paper.        |
| **Containers & Cards** | Slightly lighter cream (`#FFFDF8` / `#FFFFFF`) with 1px border (`#E8E0D0` / `#E2D8CF`)                  | Replaces harsh drop-shadows with subtle, architectural delineation.   |
| **Typography**         | Headlines: Editorial Serif (_Newsreader_ / _Fraunces_). Body/UI: Clean Sans-Serif (_Inter_ / _DM Sans_) | Pairs literary elegance and calm authority with high legibility.      |
| **Text Colors**        | Warm Charcoal (`#2B2620`) for headings/body; Muted Warm Gray (`#8A8173`) for secondary metadata         | Strictly avoids pure `#000000` to prevent harsh visual contrast.      |
| **Accent Palette**     | Primary: Muted Terracotta (`#B8643C`). Success/Completion: Soft Sage (`#7D8F6B`)                        | Strict limit to one primary focal accent color for intentional focus. |
| **Shape & Geometry**   | 10–12px rounded corners, generous micro-spacing (16–24px padding)                                       | Soft, tactile borders that feel organic and human.                    |
| **Motion**             | Gentle fades (150–200ms ease), quiet checkbox ticks; zero bouncy keyframes                              | Prevents cognitive distraction or artificial dopamine spikes.         |

---

## 4. User Journey & Screen Specifications

### 4.1 Screen 1: Registration (`/register`)

- **Purpose:** Minimal friction onboarding that sets the tranquil tone immediately.
- **Layout:** Centered single column (440px wide).
- **Components & Content:**
  - Header: TaskTrackr mark + serif headline _"Create your space"_, subline _"A quiet place for your tasks."_
  - Form Fields:
    - `Name` (Text input, placeholder: "e.g. Eleanor Vance")
    - `Email address` (Email input with format validation)
    - `Password` (Min. 8 characters, with quiet toggle eye icon for visibility)
  - Primary CTA: Full-width charcoal button (`#2B2620`) labeled **"Create account →"**.
  - Routing Link: _"Already have an account? Log in"_.
  - Reassurance copy: _"By joining, you embrace an intentional routine free from intrusive alerts and artificial urgency."_

### 4.2 Screen 2: Email OTP Verification (`/verify-otp`)

- **Purpose:** Secure, passwordless or email-confirmation handoff.
- **Layout:** Centered single column (440px wide).
- **Components & Content:**
  - Header: Serif title _"Check your inbox"_, subline _"We sent a 6-digit code to you@email.com"_.
  - 6-Digit OTP Input Grid:
    - 6 isolated single-digit input boxes.
    - Auto-advances focus upon numeric keystroke; full string paste handler automatically splits characters across the 6 slots.
    - Backspace auto-retreats focus.
  - Validation & Expiry:
    - Expiration notice: _"This code expires in 10 minutes."_
    - Resend Action: _"Resend code in 0:45"_ with disabled state countdown preventing spam.
  - CTA: Muted Terracotta button (`#B8643C`) labeled **"Verify code →"**.
  - Success Feedback: Instant soft sage (`#7D8F6B`) checkmark indication before graceful redirect to login/workspace.

### 4.3 Screen 3: Authentication / Login (`/login`)

- **Purpose:** Clean, reassuring return to the workspace.
- **Layout:** Centered single column (440px wide).
- **Components & Content:**
  - Header: Brand mark + _"Welcome back to your quiet space."_
  - Inputs: Email Address and Password (with show/hide eye icon).
  - Inline Error State: Terracotta inline alert banner when authentication fails or if email is unverified (_"Email address has not been verified yet. Verify your email →"_).
  - CTA: Charcoal button **"Log in →"**.
  - Secondary routes: _"Don't have an account? Create one"_, _"Forgot password?"_.

### 4.4 Screen 4: Tasks Workspace / Daily Contemplation (`/tasks`)

- **Purpose:** The core operational surface for planning and executing daily intentions.
- **Layout:** Centered 680px column with clean top navigation and minimal footer.
- **Header Bar:**
  - Left: TaskTrackr logo and quiet edition/journal date indicator (`JOURNAL • THURSDAY EDITION`).
  - Right: Personalized greeting (`Hi, Eleanor`) with subtle `Log out` text link.
- **Key Modules:**
  1. **Persistent Quick Add Form:**
     - Prominently docked at the top (never hidden in modals or popups).
     - Title input (_"What needs your attention?"_) + multi-line notes textarea for context.
     - Category/mood tag pill selector (_Writing_, _Ritual_, _Editorial_, _Mindful_).
     - Action button: Terracotta **"Add task +"**.
  2. **Pacing & Progress Widget:**
     - Quiet progress indicator showing unhurried pacing (e.g., _"3 focus commitments planned today • 40% cleared"_) with a soft, minimalist wave chart.
  3. **Active Task List ("Today's Focus"):**
     - Flat cream cards with 1px border.
     - Circular checkbox control.
     - Task title (medium weight) with clamped 2-line notes/context.
     - Category chip badge.
     - Contextual actions: Edit and Delete controls (visible on hover for desktop; persistent on mobile).
  4. **Completed Task Archive:**
     - Collapsible/expandable section (_"Completed (2)"_).
     - Strikethrough titles, softened opacity, sage filled checkboxes, completion timestamp.
  5. **Workspace State Handlers:**
     - **Empty State:** Centered serif statement: _"Nothing here yet. Add your first task"_ with clean whitespace and zero noisy cartoons.
     - **Loading State:** 2–3 soft skeleton pulse cards in darker cream tones.
  6. **Toasts & Feedback:**
     - Non-intrusive bottom-center toast notification pill: _"All changes saved to journal"_ or _"Signed out peacefully."_

---

## 5. Technical Architecture & Non-Functional Requirements

### 5.1 Responsive Breakpoints

- **Desktop:** Centered layout (680px max-width workspace, 440px max-width auth).
- **Mobile (<640px):** Single-column layout with 16px lateral padding, full-width inputs, and strict minimum 44px tap target sizing for all touch controls.

### 5.2 State Management & Performance

- **Background Token Refresh:** Silent authentication token renewal. Avoids mid-session session timeout popups; gracefully routes to `/login` with saved draft preserved in local state only if refresh strictly fails.
- **Form State & Keyboard Ergonomics:**
  - Auto-focus on primary input on screen mount.
  - Enter key submits single-line inputs; Cmd/Ctrl+Enter submits multi-line note fields.
- **Accessibility (a11y):**
  - WCAG AA contrast ratio compliance verified across charcoal text on warm cream backgrounds.
  - Explicit ARIA roles on custom circular checkboxes and OTP inputs.
  - Screen-reader announcements for dynamically toggled toast messages.

---

## 6. Release Roadmap & Future Milestones

- **Phase 1 (MVP — Current Canvas Baseline):**
  - Auth flow (Register, OTP, Login) and single-column Daily Tasks workspace.
  - Core task creation, check-off, deletion, and local persistence.
- **Phase 2 (Tranquil Journal Enhancements):**
  - Weekly retro / quiet reflections view.
  - Export task journal to clean Markdown or plain text.
  - Offline-first local storage sync with peaceful background reconciliation.
- **Phase 3 (Atmosphere & Customization):**
  - Warm ambient theme variants (Warm Sand, Morning Tea, Night Ink).
  - Keyboard-only navigation mode (`j`/`k` navigation, `x` toggle).
