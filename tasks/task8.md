# Task 8: Strong password validation (frontend + backend)

## Purpose
Registration only checks length (FE ≥ 8, BE Joi ≥ 6) with no complexity. Align and strengthen password rules on both sides so weak passwords cannot pass the API.

## Requirements
- Agree policy (default proposal in `taskapp-improvements.md`): min 8; upper; lower; digit; special; max 128.
- Enforce in backend Joi (and any register controller checks) — source of truth.
- Mirror rules on Register UI with clear messaging; optional live checklist.
- Same rules for any future password-change/reset endpoints when added.
- Return field-level error via Task 7 envelope when available.

## Scope
- **In scope:** `backend/utils/validators.js`, register UI validation copy, tests for password cases if test harness exists.
- **Out of scope:** Forgot-password flow implementation (listed separately under Priority 2); breached-password dictionaries (optional later).

## Notes
- Do not code until password policy is confirmed (open question in `taskapp-improvements.md`).
