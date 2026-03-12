# TClass Setup Checklist

Use this after cloning on a new machine.

## Pre-check
- [ ] Git installed
- [ ] Node.js 18+ and npm installed
- [ ] PHP 8.1+ and Composer installed
- [ ] MySQL/MariaDB running

## Clone
- [ ] Frontend repo cloned to `tclass-v1-frontend`
- [ ] Backend repo cloned to `tclass-v1-backend`

## Backend
- [ ] `composer install`
- [ ] `.env` created from `.env.example`
- [ ] Database credentials set in `.env`
- [ ] `php artisan key:generate`
- [ ] Database `tclass_db` created
- [ ] `php artisan migrate`
- [ ] `php artisan db:seed --force` (if needed)
- [ ] `php artisan storage:link`
- [ ] `php artisan serve --host=127.0.0.1 --port=8000`

## Frontend
- [ ] `npm install`
- [ ] `.env.local` created from `.env.example`
- [ ] `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`
- [ ] `npm run dev`

## Verification
- [ ] `http://localhost:3000` loads
- [ ] `http://127.0.0.1:8000` loads
- [ ] Login works
- [ ] Admin departments/org chart page loads
- [ ] Enrollment forms load and submit

## Deployment docs
- [ ] Read [Live Server Setup](./docs/LIVE_SERVER_SETUP.md)
