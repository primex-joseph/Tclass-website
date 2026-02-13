# Frontend Setup (Next.js) - Step by Step

Project path used in this guide:

`C:\Users\Primex-Howard\Desktop\tclass-v1-frontend`

## 1. Prerequisites

Install:

- Node.js 18+ (LTS recommended)
- npm

## 2. Open frontend folder

```powershell
cd C:\Users\Primex-Howard\Desktop\tclass-v1-frontend
```

## 3. Install dependencies

```powershell
npm install
```

## 4. Configure environment

Create/update `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

Make sure this matches your backend `php artisan serve` URL and port.

## 5. Start frontend dev server

```powershell
npm run dev
```

Open:

`http://localhost:3000`

## 6. Main pages to test

- Landing: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Admission form: `http://localhost:3000/admission`
- Student registration form page: `http://localhost:3000/student/enrollment`
- Admin portal: `http://localhost:3000/admin`

## 7. Seamless full local run (recommended)

Keep 2 terminals open:

Terminal A (backend):

```powershell
cd C:\xampp\htdocs\tclass-v1-backend
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal B (frontend):

```powershell
cd C:\Users\Primex-Howard\Desktop\tclass-v1-frontend
npm run dev
```

## 8. Quick flow test

1. Submit admission form with images
2. Login as admin and open Admissions tab
3. Approve or reject with reason
4. Verify:
   - Approve: credentials email is sent
   - Reject: rejection reason email is sent

## 9. Troubleshooting

- Error: `Missing NEXT_PUBLIC_API_BASE_URL`
  - Fix `.env.local`, then restart frontend server

- Upload/image not accessible
  - Ensure backend ran `php artisan storage:link`

- Email not sent
  - Recheck Gmail app password and SMTP values in backend `.env`
  - Restart backend server after `.env` changes
