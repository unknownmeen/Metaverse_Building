# 🚀 Metaverse Project Management System

یک سیستم مدیریت پروژه کامل برای مدیریت محصولات، ماموریت‌ها، کاربران و فرآیندهای تایید با معماری Monorepo.

## 📋 فهرست مطالب

- [درباره پروژه](#درباره-پروژه)
- [تکنولوژی‌ها](#تکنولوژیها)
- [پیش‌نیازها](#پیشنیازها)
- [نصب و راه‌اندازی](#نصب-و-راهاندازی)
- [ساختار پروژه](#ساختار-پروژه)
- [راهنمای Development](#راهنمای-development)
- [راهنمای Deployment](#راهنمای-deployment)
- [API Documentation](#api-documentation)

---

## 🎯 درباره پروژه

این پروژه یک سیستم جامع مدیریت پروژه است که شامل موارد زیر می‌باشد:

### ✨ قابلیت‌های اصلی

- 👥 **مدیریت کاربران**: نقش‌های Admin، User و Judge با احراز هویت JWT
- 📦 **مدیریت محصولات**: ساختار درختی محصولات با قابلیت Parent-Child
- 🎯 **مدیریت ماموریت‌ها**: ایجاد و تخصیص ماموریت با وضعیت‌ها و اولویت‌بندی
- ✅ **سیستم Judging**: مراحل تایید با وضعیت‌های مختلف
- 💬 **چت و پیام‌رسانی**: چت مستقیم در ماموریت‌ها با قابلیت آپلود فایل
- 🔔 **سیستم نوتیفیکیشن**: اطلاع‌رسانی خودکار برای رویدادها
- 📎 **مدیریت فایل**: آپلود و مدیریت پیوست‌ها (فایل و لینک)

---

## 🛠 تکنولوژی‌ها

### Backend
- **Framework**: NestJS 11
- **API**: GraphQL با Apollo Server
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + Passport
- **File Upload**: Multer
- **Language**: TypeScript

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router v7
- **API Client**: Apollo Client
- **Styling**: TailwindCSS 3
- **Icons**: Lucide React
- **Language**: JavaScript (ES6+)

---

## 📦 پیش‌نیازها

قبل از شروع، مطمئن شوید که موارد زیر نصب شده‌اند:

- **Node.js**: نسخه 18 یا بالاتر
- **npm** یا **yarn**: Package Manager
- **PostgreSQL**: نسخه 14 یا بالاتر
- **Git**: برای مدیریت نسخه

### بررسی نسخه‌ها

```bash
node --version  # باید 18.x یا بالاتر باشد
npm --version   # باید 9.x یا بالاتر باشد
psql --version  # بررسی PostgreSQL
```

---

## 🚀 نصب و راه‌اندازی

### مرحله 1: کلون کردن پروژه

```bash
git clone <repository-url>
cd mvp
```

### مرحله 2: نصب Backend

```bash
cd backend

# نصب dependencies
npm install

# کپی کردن تنظیمات محیطی
cp .env.example .env

# ویرایش فایل .env و تنظیم اطلاعات دیتابیس
# DATABASE_URL="postgresql://username:password@localhost:5432/metaverse_db?schema=public"
# JWT_SECRET="your-secret-key"
```

### مرحله 3: راه‌اندازی Database

```bash
# ایجاد دیتابیس در PostgreSQL
psql -U postgres
CREATE DATABASE metaverse_db;
\q

# اجرای Migrations
npm run prisma:generate
npm run prisma:migrate

# (اختیاری) اجرای Seed برای داده‌های اولیه
npm run prisma:seed
```

### مرحله 4: نصب Frontend

```bash
cd ../frontend

# نصب dependencies
npm install

# کپی کردن تنظیمات محیطی
cp .env.example .env

# ویرایش فایل .env
# VITE_API_URL=http://localhost:3000
# VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

### مرحله 5: اجرای پروژه

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### مرحله 6: دسترسی به برنامه

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **Prisma Studio**: `npm run prisma:studio` در پوشه backend

---

## 📁 ساختار پروژه

```
mvp/
├── backend/                    # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database Schema
│   │   ├── migrations/        # Migration Files
│   │   └── seed.ts           # Seed Data
│   ├── src/
│   │   ├── auth/             # Authentication Module
│   │   ├── user/             # User Management
│   │   ├── product/          # Product Management
│   │   ├── mission/          # Mission Management
│   │   ├── judging-step/     # Judging System
│   │   ├── chat/             # Chat System
│   │   ├── notification/     # Notification System
│   │   ├── attachment/       # File Management
│   │   └── main.ts          # Entry Point
│   ├── uploads/              # Uploaded Files (gitignored)
│   ├── .env                  # Environment Variables (gitignored)
│   ├── .env.example          # Environment Template
│   └── package.json
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # React Components
│   │   ├── pages/           # Page Components
│   │   ├── services/        # API Services
│   │   ├── graphql/         # GraphQL Queries/Mutations
│   │   ├── hooks/           # Custom Hooks
│   │   ├── utils/           # Utility Functions
│   │   ├── locales/         # i18n Translations
│   │   ├── data/            # Mock Data (Development)
│   │   └── App.jsx          # Main App Component
│   ├── public/              # Static Assets
│   ├── .env                 # Environment Variables (gitignored)
│   ├── .env.example         # Environment Template
│   └── package.json
│
├── .gitignore               # Git Ignore Rules
└── README.md               # این فایل
```

---

## 💻 راهنمای Development

### Backend Development

```bash
cd backend

# Development mode با hot reload
npm run start:dev

# Build برای production
npm run build

# اجرای production build
npm run start:prod

# Linting
npm run lint

# Testing
npm run test
npm run test:watch
npm run test:cov
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build برای production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Database Management

```bash
cd backend

# ایجاد migration جدید
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# Reset database (خطرناک!)
npx prisma migrate reset

# Prisma Studio (GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

---

## 🌐 راهنمای Deployment

### پیش‌نیاز Deploy

1. سرور لینوکس (Ubuntu 20.04+ توصیه می‌شود)
2. Node.js نصب شده
3. PostgreSQL نصب شده
4. Nginx برای Reverse Proxy
5. PM2 برای Process Management
6. دامنه و SSL Certificate

### مراحل Deploy Backend

```bash
# 1. کلون پروژه روی سرور
git clone <repository-url>
cd mvp/backend

# 2. نصب dependencies
npm install --production

# 3. تنظیم environment variables
nano .env
# DATABASE_URL="postgresql://..."
# JWT_SECRET="..."
# PORT=3000

# 4. Setup database
npm run prisma:generate
npm run prisma:migrate

# 5. Build
npm run build

# 6. نصب PM2
npm install -g pm2

# 7. اجرا با PM2
pm2 start dist/main.js --name "backend"
pm2 save
pm2 startup
```

### مراحل Deploy Frontend

```bash
cd ../frontend

# 1. نصب dependencies
npm install

# 2. تنظیم environment variables
nano .env
# VITE_API_URL=https://api.yourdomain.com
# VITE_GRAPHQL_URL=https://api.yourdomain.com/graphql

# 3. Build
npm run build

# 4. فایل‌های build در پوشه dist/ قرار می‌گیرند
# آن‌ها را به /var/www/html منتقل کنید یا با Nginx سرو کنید
```

### تنظیم Nginx

```nginx
# Backend Proxy
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### نکات امنیتی برای Production

1. ✅ JWT_SECRET قوی و تصادفی استفاده کنید
2. ✅ SSL Certificate نصب کنید (Let's Encrypt)
3. ✅ فایروال تنظیم کنید (UFW)
4. ✅ PostgreSQL را فقط روی localhost باز کنید
5. ✅ فایل .env را هیچ‌وقت commit نکنید
6. ✅ CORS را درست تنظیم کنید
7. ✅ Rate Limiting فعال کنید
8. ✅ Backup منظم از دیتابیس بگیرید

---

## 📚 API Documentation

### Authentication

تمام APIها به جز `login` و `register` نیاز به توکن JWT دارند.

**Header:**
```
Authorization: Bearer <your-jwt-token>
```

### نقش‌های کاربری

- **ADMIN**: دسترسی کامل به سیستم
- **USER**: کاربر عادی، دریافت و انجام ماموریت
- **JUDGE**: تایید و رد مراحل ماموریت

### وضعیت‌های ماموریت

- `PENDING`: در انتظار شروع
- `IN_PROGRESS`: در حال انجام
- `JUDGING`: در حال بررسی
- `NEEDS_FIX`: نیاز به اصلاح
- `DONE`: تکمیل شده

### GraphQL Queries & Mutations

برای مشاهده تمام Queries و Mutations موجود:
1. Backend را اجرا کنید
2. به آدرس http://localhost:3000/graphql بروید
3. از GraphQL Playground استفاده کنید

**نمونه Query:**
```graphql
query {
  missions {
    id
    title
    status
    assignee {
      name
    }
  }
}
```

**نمونه Mutation:**
```graphql
mutation {
  createMission(input: {
    title: "ماموریت جدید"
    description: "توضیحات"
    assigneeId: 1
    productId: "prod-1"
    dueDate: "2026-03-01"
  }) {
    id
    title
  }
}
```

---

## 🤝 مشارکت

برای مشارکت در پروژه:

1. Fork کنید
2. Branch جدید بسازید (`git checkout -b feature/AmazingFeature`)
3. تغییرات را Commit کنید (`git commit -m 'Add some AmazingFeature'`)
4. Push کنید (`git push origin feature/AmazingFeature`)
5. Pull Request باز کنید

---

## 📝 License

این پروژه تحت لایسنس UNLICENSED است - فایل LICENSE را برای جزئیات ببینید.

---

## 👥 تیم توسعه

- **Backend Developer**: [نام]
- **Frontend Developer**: [نام]
- **Database Designer**: [نام]

---

## 📞 پشتیبانی

در صورت بروز مشکل یا سوال:
- Issue باز کنید در GitHub
- با تیم توسعه تماس بگیرید

---

**ساخته شده با ❤️ در ایران**
