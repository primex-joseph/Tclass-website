# TClass Docs Index

## Start Here
- `../README.md` - frontend overview
- `../LOCAL_SETUP.md` - full local frontend + backend setup
- `./frontend-setup.md` - frontend-only setup
- `../SETUP_CHECKLIST.md` - fast setup checklist
- `./WORKSTATION_SETUP_CHECKLIST.md` - workstation checklist
- `./LIVE_SERVER_SETUP.md` - production/live deployment guide
- `./AI_PROMPT.md` - AI handoff/context prompt
- `./REVIEW_2026-03-09.md` - engineering review snapshot

## Repositories
- Frontend: `tclass-v1-frontend`
- Backend: `tclass-v1-backend`

## Current Architecture Highlights
- Curriculum is versioned in backend (`curriculum_versions`, `curriculum_subjects`).
- Active curriculum syncs into `courses`.
- Admin Class Scheduling loads by `Period + Course + Year` from curriculum-synced courses.
- `class_offerings` stores actual section/teacher/room/day/time assignments.
- Student enrollment and schedule read offerings after assignment.

## URLs (Default)
- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`
- API: `http://127.0.0.1:8000/api`
