# راهنمای جامع Deploy در Production

این سند راهنمای کامل deploy کردن پروژه روی سرور production است.

## 📋 فهرست

- [پیش‌نیازها](#پیشنیازها)
- [معماری Production](#معماری-production)
- [آماده‌سازی سرور](#آمادهسازی-سرور)
- [Deploy Backend](#deploy-backend)
- [Deploy Frontend](#deploy-frontend)
- [تنظیم Nginx](#تنظیم-nginx)
- [SSL Certificate](#ssl-certificate)
- [Database Setup](#database-setup)
- [Monitoring](#monitoring)
- [Backup](#backup)
- [Troubleshooting](#troubleshooting)

---

## 🔧 پیش‌نیازها

### سرور

- **OS**: Ubuntu 20.04 LTS یا 22.04 LTS
- **RAM**: حداقل 2GB (4GB توصیه می‌شود)
- **Storage**: حداقل 20GB
- **CPU**: 2 Core یا بیشتر

### دامنه

- دامنه خریداری شده (مثلا: `example.com`)
- دسترسی به DNS Management

### نرم‌افزارهای مورد نیاز

```bash
# بروزرسانی سیستم
sudo apt update && sudo apt upgrade -y

# نصب ابزارهای پایه
sudo apt install -y curl wget git build-essential
```

---

## 🏗 معماری Production

```
                    Internet
                       |
                   [Cloudflare]
                       |
                    [Nginx]
                    (Port 80/443)
                       |
          +------------+------------+
          |                         |
    [Backend API]            [Frontend Static]
    (Port 3000)              (Static Files)
          |
    [PostgreSQL]
    (Port 5432)
```

---

## 🖥 آماده‌سازی سرور

### 1. اتصال به سرور

```bash
ssh username@your-server-ip
```

### 2. ایجاد کاربر جدید (امنیت)

```bash
# ایجاد کاربر
sudo adduser deploy
sudo usermod -aG sudo deploy

# تنظیم SSH Key
su - deploy
mkdir ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Public key خود را paste کنید
chmod 600 ~/.ssh/authorized_keys
```

### 3. نصب Node.js

```bash
# نصب NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# نصب Node.js (LTS)
nvm install --lts
nvm use --lts

# بررسی نصب
node --version  # باید v20.x یا بالاتر باشد
npm --version
```

### 4. نصب PostgreSQL

```bash
# نصب PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# شروع سرویس
sudo systemctl start postgresql
sudo systemctl enable postgresql

# ایجاد دیتابیس و کاربر
sudo -u postgres psql

# در PostgreSQL:
CREATE DATABASE metaverse_db;
CREATE USER metaverse_user WITH ENCRYPTED PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE metaverse_db TO metaverse_user;
\q
```

### 5. نصب Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. نصب PM2

```bash
npm install -g pm2
```

### 7. تنظیم Firewall

```bash
# فعال کردن UFW
sudo ufw enable

# اجازه دسترسی
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# بررسی وضعیت
sudo ufw status
```

---

## 🚀 Deploy Backend

### 1. کلون پروژه

```bash
cd /var/www
sudo mkdir -p apps
sudo chown deploy:deploy apps
cd apps

git clone https://github.com/your-username/mvp.git
cd mvp/backend
```

### 2. نصب Dependencies

```bash
npm install --production
```

### 3. تنظیم Environment Variables

```bash
nano .env
```

محتوای `.env`:

```env
# Database
DATABASE_URL="postgresql://metaverse_user:your-strong-password@localhost:5432/metaverse_db?schema=public"

# JWT Secret (تولید با openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-production-xxxxx"

# Server
NODE_ENV=production
PORT=3000

# File Upload
UPLOAD_DIR=/var/www/apps/mvp/backend/uploads

# CORS (دامنه frontend)
ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

### 4. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# اجرای Migrations
npm run prisma:migrate

# (اختیاری) Seed data
npm run prisma:seed
```

### 5. Build

```bash
npm run build
```

### 6. ایجاد پوشه uploads

```bash
mkdir -p uploads
chmod 755 uploads
```

### 7. اجرا با PM2

```bash
# شروع با PM2
pm2 start dist/main.js --name backend-api --node-args="--max-old-space-size=2048"

# ذخیره تنظیمات
pm2 save

# Auto-start در startup
pm2 startup
# دستوری که نمایش می‌دهد را اجرا کنید

# بررسی وضعیت
pm2 status
pm2 logs backend-api
```

### 8. PM2 Ecosystem File (پیشرفته)

```bash
nano ecosystem.config.js
```

محتوا:

```javascript
module.exports = {
  apps: [{
    name: 'backend-api',
    script: './dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
```

اجرا:

```bash
mkdir logs
pm2 start ecosystem.config.js
```

---

## 🎨 Deploy Frontend

### 1. Build Frontend

```bash
cd /var/www/apps/mvp/frontend

# تنظیم Environment
nano .env
```

محتوای `.env`:

```env
VITE_API_URL=https://api.example.com
VITE_GRAPHQL_URL=https://api.example.com/graphql
```

### 2. نصب و Build

```bash
npm install
npm run build
```

فایل‌های build در `dist/` قرار می‌گیرند.

### 3. انتقال به پوشه وب

```bash
sudo mkdir -p /var/www/html/frontend
sudo cp -r dist/* /var/www/html/frontend/
sudo chown -R www-data:www-data /var/www/html/frontend
sudo chmod -R 755 /var/www/html/frontend
```

---

## ⚙️ تنظیم Nginx

### 1. Backend Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/backend-api
```

محتوا:

```nginx
# Backend API
server {
    listen 80;
    server_name api.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    # SSL Certificates (بعد از نصب Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Logs
    access_log /var/log/nginx/backend-api.access.log;
    error_log /var/log/nginx/backend-api.error.log;
    
    # Proxy Settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # File Upload (حداکثر 10MB)
    client_max_body_size 10M;
}
```

### 2. Frontend

```bash
sudo nano /etc/nginx/sites-available/frontend
```

محتوا:

```nginx
# Frontend
server {
    listen 80;
    server_name example.com www.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Root directory
    root /var/www/html/frontend;
    index index.html;
    
    # Logs
    access_log /var/log/nginx/frontend.access.log;
    error_log /var/log/nginx/frontend.error.log;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;
    
    # Cache static assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

### 3. فعال‌سازی Sites

```bash
# فعال کردن
sudo ln -s /etc/nginx/sites-available/backend-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/

# حذف default
sudo rm /etc/nginx/sites-enabled/default

# تست تنظیمات
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔐 SSL Certificate (Let's Encrypt)

### 1. نصب Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. دریافت Certificate

```bash
# برای Backend
sudo certbot --nginx -d api.example.com

# برای Frontend
sudo certbot --nginx -d example.com -d www.example.com
```

### 3. تست تمدید خودکار

```bash
sudo certbot renew --dry-run
```

Certificate به صورت خودکار هر 90 روز تمدید می‌شود.

---

## 🗄 Database Setup

### تنظیمات امنیتی PostgreSQL

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

فقط اجازه دسترسی localhost:

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
```

Restart:

```bash
sudo systemctl restart postgresql
```

---

## 📊 Monitoring

### 1. PM2 Monitoring

```bash
# Dashboard
pm2 monit

# Logs realtime
pm2 logs

# Status
pm2 status

# Memory/CPU usage
pm2 list
```

### 2. Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/backend-api.access.log
sudo tail -f /var/log/nginx/frontend.access.log

# Error logs
sudo tail -f /var/log/nginx/backend-api.error.log
sudo tail -f /var/log/nginx/frontend.error.log
```

### 3. PostgreSQL Monitoring

```bash
# اتصال به database
psql -U metaverse_user -d metaverse_db

# در PostgreSQL:
# بررسی اندازه database
SELECT pg_size_pretty(pg_database_size('metaverse_db'));

# بررسی تعداد اتصالات
SELECT count(*) FROM pg_stat_activity;
```

---

## 💾 Backup

### 1. Database Backup

ایجاد اسکریپت backup:

```bash
nano ~/backup-db.sh
```

محتوا:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="metaverse_db_$DATE.sql"

mkdir -p $BACKUP_DIR

# Backup
pg_dump -U metaverse_user metaverse_db > $BACKUP_DIR/$FILENAME

# Compress
gzip $BACKUP_DIR/$FILENAME

# حذف backup های قدیمی‌تر از 30 روز
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME.gz"
```

اجرای خودکار با cron:

```bash
chmod +x ~/backup-db.sh

# ویرایش crontab
crontab -e

# اضافه کردن: backup روزانه ساعت 2 صبح
0 2 * * * ~/backup-db.sh >> ~/backup.log 2>&1
```

### 2. Files Backup

```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/apps/mvp/backend/uploads
```

---

## 🔄 بروزرسانی (Update/Deploy جدید)

### اسکریپت Deploy:

```bash
nano ~/deploy.sh
```

محتوا:

```bash
#!/bin/bash

cd /var/www/apps/mvp

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Backend: Installing dependencies..."
cd backend
npm install --production

echo "🏗 Backend: Building..."
npm run build

echo "🗄 Backend: Running migrations..."
npm run prisma:migrate

echo "🔄 Backend: Restarting PM2..."
pm2 restart backend-api

echo "📦 Frontend: Installing dependencies..."
cd ../frontend
npm install

echo "🏗 Frontend: Building..."
npm run build

echo "📂 Frontend: Copying files..."
sudo cp -r dist/* /var/www/html/frontend/

echo "✅ Deploy completed!"
```

اجرا:

```bash
chmod +x ~/deploy.sh
~/deploy.sh
```

---

## 🐛 Troubleshooting

### Backend not responding

```bash
# بررسی logs
pm2 logs backend-api

# Restart
pm2 restart backend-api

# بررسی پورت
netstat -tlnp | grep 3000
```

### Database connection error

```bash
# بررسی PostgreSQL
sudo systemctl status postgresql

# بررسی اتصال
psql -U metaverse_user -d metaverse_db -h localhost

# بررسی .env
cat /var/www/apps/mvp/backend/.env
```

### Nginx errors

```bash
# تست configuration
sudo nginx -t

# بررسی error logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

### SSL issues

```bash
# تست certificate
sudo certbot certificates

# تمدید دستی
sudo certbot renew
```

### Out of memory

```bash
# بررسی استفاده از RAM
free -h

# بررسی PM2
pm2 list

# کاهش instances یا افزایش RAM سرور
```

---

## 📞 Support

در صورت بروز مشکل:

1. بررسی logs (PM2, Nginx, PostgreSQL)
2. بررسی firewall و پورت‌ها
3. بررسی تنظیمات DNS
4. بررسی SSL certificates

---

**موفق باشید! 🚀**
