# TClass Workstation Setup Checklist

## Required software
- Git
- Node.js 18+
- npm 9+
- PHP 8.1+ and Composer
- MySQL/MariaDB (XAMPP optional)
- VS Code (recommended)

## Recommended local paths
```text
C:\Projects\tclass-v1-frontend
C:\xampp\htdocs\tclass-v1-backend
```

## Backend first
```powershell
cd C:\xampp\htdocs\tclass-v1-backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --force
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

## Frontend
```powershell
cd C:\Projects\tclass-v1-frontend
npm install
copy .env.example .env.local
npm run dev
```

Set `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

## Smoke test
- Admin login and dashboard load
- Departments org chart loads and saves
- Enrollment forms load and submit
- Curriculum and scheduling pages load

## References
- [Local Setup](../LOCAL_SETUP.md)
- [Setup Checklist](../SETUP_CHECKLIST.md)
- [Live Server Setup](./LIVE_SERVER_SETUP.md)
