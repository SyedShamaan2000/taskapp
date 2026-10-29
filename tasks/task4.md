# Task 4: Database & Data Modeling

## Purpose
Enhance data models to support rich task planning, metadata, temporal tracking, and performance optimization through proper database indexes.

## Requirements
- Update `Task` schema with:
  - `status` enum (`pending`, `in-progress`, `completed`).
  - `priority` enum (`low`, `medium`, `high`, `urgent`).
  - `dueDate` field for deadlines.
  - `tags` array for categorization.
  - Automatic `createdAt` and `updatedAt` via `{ timestamps: true }`.
  - Compound indexes on `{ userId: 1, status: 1, dueDate: 1 }` and `{ tags: 1 }`.
- Update `User` schema with:
  - Timestamps and tracking fields (`updatedAt`, `lastLogin`, `onlineStatus`).
  - Single index on `isVerified` (avoiding redundant index definitions on `email`).

## Scope
- **In Scope:**
  - `backend/models/Task.js` schema enhancements and compound indexes.
  - `backend/models/User.js` metadata fields and index deduplication.
- **Out of Scope:**
  - Database migration scripts for legacy external databases (running locally on MongoDB).

## Notes
- Backward compatibility maintained for routes that still read or set `completed` boolean where applicable.
