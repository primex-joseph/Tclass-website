# Complete Local Setup Guide (New Device)

This guide walks you through setting up the TClass School Management System on a new machine. Both frontend (Next.js) and backend (Laravel) are required.

## 📋 Prerequisites

Install these before starting:

| Software | Version | Download |
|----------|---------|----------|
| Git | Latest | [git-scm.com](https://git-scm.com) |
| Node.js | 18+ LTS | [nodejs.org](https://nodejs.org) |
| PHP | 8.1+ (8.2 recommended) | [php.net](https://php.net) |
| Composer | Latest | [getcomposer.org](https://getcomposer.org) |
| MySQL/MariaDB | 5.7+ / 10.3+ | Included with XAMPP |

**Windows Users**: Install [XAMPP](https://www.apachefriends.org) for PHP + MySQL + phpMyAdmin stack.

## 📁 Recommended Folder Structure

```
C:\Projects\
├── Tclass-website\              (frontend)
└── Tclass-website-backend\      (backend)
```

---

## 🖥 Part 1: Backend Setup (Laravel)

### 1. Clone Backend Repository

```powershell
cd C:\Projects
git clone https://github.com/primex-joseph/Tclass-website-backend.git
```

### 2. Navigate to Backend Folder

```powershell
cd Tclass-website-backend
```

### 3. Install PHP Dependencies

```powershell
composer install
```

### 4. Configure Environment

Copy example environment file:

```powershell
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env` and configure:

```env
# Application
APP_NAME="TClass"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tclass_db
DB_USERNAME=root
DB_PASSWORD=          # Your MySQL password

# Frontend (CORS)
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost

# Email (SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="Tarlac Center for Learning and Skills Success"
CONTACT_RECEIVER_EMAIL=receiver@example.com
```

### 5. Generate Application Key

```powershell
php artisan key:generate
```

### 6. Create Database

1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Click "New" database
3. Name it: `tclass_db`
4. Collation: `utf8mb4_unicode_ci`

Or via MySQL CLI:

```sql
CREATE DATABASE tclass_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 7. Run Migrations

```powershell
php artisan migrate
```

### 8. Create Storage Link

```powershell
php artisan storage:link
```

### 9. Seed Database (Optional)

```powershell
php artisan db:seed
```

### 10. Start Backend Server

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Backend is now running at: `http://127.0.0.1:8000`

---

## 🎨 Part 2: Frontend Setup (Next.js)

### 1. Clone Frontend Repository

Open a **new terminal** (don't close the backend one):

```powershell
cd C:\Projects
git clone https://github.com/primex-joseph/Tclass-website.git
```

### 2. Navigate to Frontend Folder

```powershell
cd Tclass-website
```

### 3. Install Node Dependencies

```powershell
npm install
```

This installs:
- Next.js 15
- React 19
- Tailwind CSS 4
- shadcn/ui components
- Lucide icons
- And all other dependencies from `package.json`

### 4. Configure Environment

Create `.env.local`:

```powershell
# Windows
Copy-Item .env.example .env.local

# Mac/Linux  
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

### 5. Start Frontend Development Server

```powershell
npm run dev
```

Frontend is now running at: `http://localhost:3000`

---

## ✅ Verification Checklist

After both servers are running, verify:

- [ ] Landing page loads: `http://localhost:3000`
- [ ] Login page works: `http://localhost:3000/login`
- [ ] Can login with test credentials
- [ ] Backend API responds: `http://127.0.0.1:8000/api`
- [ ] Contact form submission works
- [ ] Theme toggle (light/dark) persists

---

## 🔄 Daily Development Workflow

Keep **two terminals** open:

### Terminal 1 - Backend
```powershell
cd C:\Projects\Tclass-website-backend
php artisan serve --host=127.0.0.1 --port=8000
```

### Terminal 2 - Frontend
```powershell
cd C:\Projects\Tclass-website
npm run dev
```

---

## 🐛 Common Issues & Solutions

### Issue: CORS / 401 / CSRF Errors

**Solution:**
```powershell
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

Verify `.env` values:
```env
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

### Issue: Frontend changes not reflecting

**Solution:**
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

### Issue: Port 3000 already in use

**Solution:**
```powershell
npx kill-port 3000
npm run dev
```

### Issue: Database connection failed

**Solution:**
- Verify MySQL is running (XAMPP Control Panel)
- Check `.env` DB credentials
- Ensure database `tclass_db` exists

### Issue: Email not sending

**Solution:**
- Verify SMTP credentials in backend `.env`
- For Gmail: Use App Password (not regular password)
- Check `storage/logs/laravel.log` for errors

### Issue: Image uploads not working

**Solution:**
```powershell
php artisan storage:link
```

---

## 📦 Dependencies Summary

### Backend (composer.json)
- Laravel 10.x
- Laravel Sanctum (API authentication)
- Illuminate packages
- PHPMailer (email)

### Frontend (package.json)
- next: ^15.x
- react: ^19.x
- typescript: ^5.x
- tailwindcss: ^4.x
- @radix-ui/* (shadcn/ui primitives)
- lucide-react (icons)
- react-hot-toast (notifications)
- class-variance-authority
- clsx, tailwind-merge (utilities)

---

## 📚 Additional Documentation

- [docs/frontend-setup.md](./docs/frontend-setup.md) - Detailed frontend guide
- [docs/AI_PROMPT.md](./docs/AI_PROMPT.md) - AI assistant instructions
- Backend docs: See `Tclass-website-backend/docs/`

---

## 🆘 Need Help?

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review backend logs: `storage/logs/laravel.log`
3. Check browser console for frontend errors
4. Verify all prerequisites are installed correctly

---

## 📝 Notes

- **Port Configuration**: Backend uses `8000`, Frontend uses `3000`
- **Database**: MySQL/MariaDB required
- **Email**: SMTP configuration required for contact forms
- **Storage**: Ensure `storage/app/public` is writable
