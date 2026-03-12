# Frontend Setup Guide

## Prerequisites
- Node.js 18+
- npm 9+
- Running backend API (`http://127.0.0.1:8000`)

## Clone and install
```bash
git clone <FRONTEND_REPO_URL> tclass-v1-frontend
cd tclass-v1-frontend
npm install
```

## Environment
Create `.env.local` from sample:
```bash
cp .env.example .env.local
```

Set:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

## Run
```bash
npm run dev
```

App URL: `http://localhost:3000`

## Production build check
```bash
npm run lint
npm run build
```

## Troubleshooting
- API request failures: check backend URL and backend server status.
- Stale UI: clear `.next` and restart dev server.
- Port conflict: run on another port (`npm run dev -- -p 3001`).
