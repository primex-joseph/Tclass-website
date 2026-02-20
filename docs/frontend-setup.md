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
- Vocational form: `http://localhost:3000/vocational`
- Student enrollment page: `http://localhost:3000/student/enrollment`
- Student portal: `http://localhost:3000/student`
- Faculty portal: `http://localhost:3000/faculty`
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

1. Submit admission form with required images.
2. Submit vocational form with at least one enrollment intention.
3. If `Others` is selected under intention, provide the specify value.
4. Submit contact form from landing page.
5. Login as admin and review admissions and inbox.
6. Approve/reject admission and verify outgoing email behavior.
7. Check mobile layouts for landing, student, faculty, and admin pages.

## 9. Mobile UI notes

Current frontend mobile behavior:

- Landing uses off-canvas sidebar menu.
- Student, faculty, and admin pages use unified mobile sidebar pattern.
- Portal pages include bottom navigation for primary actions.

## 10. Backend dependency note

For current frontend fields/features, backend should include latest migrations:

- `2026_02_19_050000_create_contact_messages_table`
- `2026_02_20_090000_add_enrollment_purposes_to_admission_applications`

Run in backend repo if needed:

```powershell
php artisan migrate
```

## 11. Troubleshooting

- Error: `Missing NEXT_PUBLIC_API_BASE_URL`
  - Fix `.env.local`, then restart frontend server.

- Upload/image not accessible:
  - Ensure backend ran `php artisan storage:link`.

- Email not sent:
  - Recheck SMTP values in backend `.env`.
  - Restart backend server after `.env` changes.
