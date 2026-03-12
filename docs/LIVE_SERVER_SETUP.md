# Live Server Setup (Production)

This guide covers a standard Linux deployment:
- Frontend (Next.js) behind Nginx using PM2
- Backend (Laravel) behind Nginx + PHP-FPM
- MySQL database
- SSL via Certbot

## 1) Server prerequisites
- Ubuntu 22.04+ (or equivalent Linux)
- Domain/subdomain for frontend and API
- Open ports: `80`, `443`, `22`

Install base packages:
```bash
sudo apt update
sudo apt install -y nginx mysql-server php php-fpm php-mysql php-xml php-mbstring php-curl unzip git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2) Clone projects
```bash
cd /var/www
sudo git clone <FRONTEND_REPO_URL> tclass-v1-frontend
sudo git clone <BACKEND_REPO_URL> tclass-v1-backend
sudo chown -R $USER:$USER /var/www/tclass-v1-frontend /var/www/tclass-v1-backend
```

## 3) Backend setup (Laravel)
```bash
cd /var/www/tclass-v1-backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
```

Set backend `.env` (production values):
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tclass_db
DB_USERNAME=tclass_user
DB_PASSWORD=strong_password

FRONTEND_URL=https://yourdomain.com
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

Run:
```bash
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Set permissions:
```bash
sudo chown -R www-data:www-data /var/www/tclass-v1-backend/storage /var/www/tclass-v1-backend/bootstrap/cache
sudo chmod -R 775 /var/www/tclass-v1-backend/storage /var/www/tclass-v1-backend/bootstrap/cache
```

## 4) Frontend setup (Next.js)
```bash
cd /var/www/tclass-v1-frontend
npm install
cp .env.example .env.local
```

Set frontend `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

Build and start:
```bash
npm run build
pm2 start npm --name tclass-frontend -- start
pm2 save
pm2 startup
```

## 5) Nginx config

### Frontend site (`/etc/nginx/sites-available/tclass-frontend`)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### API site (`/etc/nginx/sites-available/tclass-api`)
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/tclass-v1-backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/tclass-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/tclass-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6) SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com
```

## 7) Operations
Frontend:
```bash
pm2 status
pm2 restart tclass-frontend
```

Backend:
```bash
cd /var/www/tclass-v1-backend
php artisan optimize
```

Logs:
```bash
pm2 logs tclass-frontend
sudo tail -f /var/log/nginx/error.log
```

## 8) Deploy updates
Backend:
```bash
cd /var/www/tclass-v1-backend
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
```

Frontend:
```bash
cd /var/www/tclass-v1-frontend
git pull
npm install
npm run build
pm2 restart tclass-frontend
```
