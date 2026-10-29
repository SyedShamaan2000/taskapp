# Task 6 — Incremental commits & development.md tracking in agent rules

## Purpose

Make the agent prefer small, focused commits over large change dumps, and keep `development.md` continuously appended so project progress stays trackable.

## Requirements

- Add incremental-commit guidance to local user rules (`~/.cursor/rules/agent-operating.mdc`).
- Add the same guidance to project docs/rules: `agent-rule.md` and `.cursor/rules/agent-operating.mdc`.
- Strengthen `development.md` update/append wording (what changed/modified, files touched).

## Scope

- **In:** Agent rule text (local + project).
- **Out:** Changing commit automation, CI, or application code.

## Notes

- Branch: `docs/incremental-commits-tracking`
- Local rule lives outside the repo; project files are versioned.
