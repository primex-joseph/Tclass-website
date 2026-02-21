# TClass Setup Checklist

Use this checklist when setting up on a new device.

## ✅ Pre-Setup Requirements

- [ ] Git installed
- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] PHP 8.1+ installed
- [ ] Composer installed
- [ ] MySQL/MariaDB installed (XAMPP recommended for Windows)

## ✅ Step 1: Clone Repositories

```bash
# Create projects folder
mkdir C:\Projects
cd C:\Projects

# Clone repositories
git clone https://github.com/primex-joseph/Tclass-website.git
git clone https://github.com/primex-joseph/Tclass-website-backend.git
```

## ✅ Step 2: Backend Setup

```bash
cd C:\Projects\Tclass-website-backend
```

- [ ] Run `composer install`
- [ ] Copy `.env.example` to `.env`
- [ ] Configure database in `.env`:
  - [ ] DB_DATABASE=tclass_db
  - [ ] DB_USERNAME=root
  - [ ] DB_PASSWORD= (your password)
- [ ] Configure mail in `.env` (optional for contact form)
- [ ] Run `php artisan key:generate`
- [ ] Create database `tclass_db` in MySQL
- [ ] Run `php artisan migrate`
- [ ] Run `php artisan storage:link`
- [ ] Start server: `php artisan serve --host=127.0.0.1 --port=8000`

**Verify**: http://127.0.0.1:8000 shows Laravel welcome

## ✅ Step 3: Frontend Setup

```bash
cd C:\Projects\Tclass-website
```

- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Verify `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`
- [ ] Run `npm run dev`

**Verify**: http://localhost:3000 loads landing page

## ✅ Step 4: Test Full Flow

- [ ] Landing page loads
- [ ] Can toggle dark mode
- [ ] Mobile menu works
- [ ] Login page accessible
- [ ] Can login with test account
- [ ] Dashboard loads for logged-in user
- [ ] Contact form submits (if email configured)

## ✅ Daily Development Commands

**Terminal 1 - Backend:**
```bash
cd C:\Projects\Tclass-website-backend
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 - Frontend:**
```bash
cd C:\Projects\Tclass-website
npm run dev
```

## 🐛 Common Post-Setup Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check backend `.env` FRONTEND_URL and SANCTUM_STATEFUL_DOMAINS |
| 401 on login | Clear cookies, restart both servers |
| Database error | Verify MySQL running, check credentials |
| Port 3000 in use | `npx kill-port 3000` |
| Changes not showing | Clear `.next` folder |

## 📚 Documentation Reference

- Full setup: [LOCAL_SETUP.md](./LOCAL_SETUP.md)
- Frontend only: [docs/frontend-setup.md](./docs/frontend-setup.md)
- AI assistance: [docs/AI_PROMPT.md](./docs/AI_PROMPT.md)

## 🎉 You're Ready!

Once all checkboxes are ticked, you're ready to develop!

Access points:
- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000
