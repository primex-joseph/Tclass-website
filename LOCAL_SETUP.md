# Local Setup Guide (New Device)

This guide sets up both projects locally:

- Frontend: https://github.com/primex-joseph/Tclass-website.git
- Backend: https://github.com/primex-joseph/Tclass-website-backend.git

## 1. Prerequisites

Install these first:

- Git
- Node.js 18+ and npm
- PHP 8.1+ (8.2 recommended)
- Composer
- MySQL/MariaDB
- (Optional, Windows) XAMPP/Laragon for PHP + MySQL stack

## 2. Clone Repositories

Choose a parent folder, then clone both repos:

```powershell
git clone https://github.com/primex-joseph/Tclass-website.git
git clone https://github.com/primex-joseph/Tclass-website-backend.git
```

Result:

- `Tclass-website` (frontend)
- `Tclass-website-backend` (backend)

## 3. Backend Setup (Laravel)

Go to backend:

```powershell
cd Tclass-website-backend
```

Install PHP dependencies:

```powershell
composer install
```

Copy env:

```powershell
Copy-Item .env.example .env
```

Generate app key:

```powershell
php artisan key:generate
```

### Configure backend `.env`

Update at least these values:

```env
APP_NAME="TClass"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tclass_db
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost

MAIL_MAILER=smtp
MAIL_HOST=...
MAIL_PORT=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=...
MAIL_FROM_NAME="Tarlac Center for Learning and Skills Success"
CONTACT_RECEIVER_EMAIL=...
```

Create database (example name above: `tclass_db`) in MySQL.

Run migrations:

```powershell
php artisan migrate
```

Clear cached config:

```powershell
php artisan config:clear
php artisan cache:clear
```

Start backend server:

```powershell
php artisan serve
```

Backend URL: `http://127.0.0.1:8000`

## 4. Frontend Setup (Next.js)

Open a new terminal, go to frontend:

```powershell
cd Tclass-website
```

Install dependencies:

```powershell
npm install
```

Copy env:

```powershell
Copy-Item .env.example .env.local
```

### Configure frontend `.env.local`

Set API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

Start frontend server:

```powershell
npm run dev
```

Frontend URL: `http://localhost:3000`

## 5. Login / Test Flow

- Open `http://localhost:3000`
- Use your existing seeded/admin/student accounts (if available)
- If no users exist yet, create/seed users from backend (project-specific seeding/creation flow)

## 6. Common Issues

### A) CORS / 401 / CSRF issues

- Confirm backend `.env` values:
  - `FRONTEND_URL=http://localhost:3000`
  - `SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000`
- Run:

```powershell
php artisan config:clear
php artisan cache:clear
```

### B) Frontend not reflecting latest changes

```powershell
# from frontend folder
Remove-Item -Recurse -Force .next
npm run dev
```

### C) Backend route/config changes not reflected

```powershell
php artisan optimize:clear
php artisan serve
```

### D) Email not sending

- Verify SMTP values in backend `.env`
- Check `storage/logs/laravel.log`

## 7. Daily Run Commands

Backend terminal:

```powershell
cd Tclass-website-backend
php artisan serve
```

Frontend terminal:

```powershell
cd Tclass-website
npm run dev
```

## 8. Suggested Folder Layout

Keep both repos side-by-side:

```text
C:\Projects\
  Tclass-website\
  Tclass-website-backend\
```

This makes local full-stack dev simpler.
