# TClass Frontend (Next.js)

Frontend for the TClass School Management System with public landing pages and portal routes for student, faculty, and admin.

## Portals and Routes

- Landing: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Student Portal: `http://localhost:3000/student`
- Faculty Portal: `http://localhost:3000/faculty`
- Admin Portal: `http://localhost:3000/admin`
- Vocational Enrollment Form: `http://localhost:3000/vocational`

## Recent UI Updates

- Modern blue UI system (typography, spacing, tokens, cards/buttons, transitions)
- Global light/dark mode with persistence
- Dark-mode readability fixes across landing, login, student, faculty, and admin pages
- Mobile UX polish for landing, student, faculty, and admin
- Unified mobile sidebar/hamburger behavior (overlay + slide-in sidebar pattern)
- Unified avatar dropdown actions (theme + logout) on portal headers

## Recent Feature Updates

- Contact form is API-backed and sends email through backend
- Admin inbox is dynamic from landing-page contact messages
- Admin dashboard users/stats are API-driven
- Student enrollment flow refactored (available subjects, pre-enlisted, assess flow)
- Vocational enrollment form now includes:
  - Purpose(s)/intention for enrolling
  - Others (specify) support

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide icons

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000`

For full setup guide, see `docs/frontend-setup.md`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
