# TClass Frontend (Next.js 16)

Frontend portal for TClass with student, faculty, and admin modules.

## Stack
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Laravel backend API via `apiFetch`

## Clone + Local Run
1. Clone frontend:
```bash
git clone <FRONTEND_REPO_URL> tclass-v1-frontend
cd tclass-v1-frontend
```
2. Install dependencies:
```bash
npm install
```
3. Configure env:
```bash
cp .env.example .env.local
```
Set:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```
4. Run dev server:
```bash
npm run dev
```
Frontend: `http://localhost:3000`

## Scripts
```bash
npm run dev
npm run lint
npm run build
npx tsc --noEmit
```

## Full Documentation
- [Local Full Setup](./LOCAL_SETUP.md)
- [Setup Checklist](./SETUP_CHECKLIST.md)
- [Docs Index](./docs/README.md)
- [Live Server Setup](./docs/LIVE_SERVER_SETUP.md)

