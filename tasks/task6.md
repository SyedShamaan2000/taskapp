# Task 6 — Incremental commits & development.md tracking in agent rules

## Purpose

Make the agent prefer small, focused commits over large change dumps, and keep `development.md` continuously appended so project progress stays trackable.

## Requirements

- Add incremental-commit guidance to local user rules (`~/.cursor/rules/agent-operating.mdc`).
- Add the same guidance to project `agent-rule.md` (versioned).
- Strengthen `development.md` update/append wording (what changed/modified, files touched).
- Do **not** commit `.cursor/rules/` — keep Cursor rules local (`~/.cursor/rules/`); ignore `.cursor/` in git.

## Scope

- **In:** Agent rule text (local user rules + project `agent-rule.md`).
- **Out:** Committing `.cursor/` to the repo; changing commit automation, CI, or application code.

## Notes

- Branch: `docs/incremental-commits-tracking`
- Local always-apply rule: `~/.cursor/rules/agent-operating.mdc`
- Project source of truth for the team: `agent-rule.md` only
