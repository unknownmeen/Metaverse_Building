# Backend - Metaverse Project Management API

Backend پروژه مدیریت ماموریت‌ها بر پایه NestJS و GraphQL.

## 🛠 تکنولوژی‌ها

- **NestJS 11**: Progressive Node.js Framework
- **GraphQL**: با Apollo Server برای API
- **Prisma**: ORM مدرن برای PostgreSQL
- **PostgreSQL**: دیتابیس اصلی
- **JWT**: احراز هویت
- **Passport**: استراتژی Authentication
- **Multer**: آپلود فایل
- **TypeScript**: زبان برنامه‌نویسی

## 📋 ساختار ماژول‌ها

```
src/
├── auth/                   # احراز هویت و Authorization
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.resolver.ts
│   ├── jwt.strategy.ts
│   └── guards/
│
├── user/                   # مدیریت کاربران
│   ├── user.module.ts
│   ├── user.service.ts
│   ├── user.resolver.ts
│   └── dto/
│
├── product/               # مدیریت محصولات (درختی)
│   ├── product.module.ts
│   ├── product.service.ts
│   ├── product.resolver.ts
│   └── dto/
│
├── mission/               # مدیریت ماموریت‌ها
│   ├── mission.module.ts
│   ├── mission.service.ts
│   ├── mission.resolver.ts
│   └── dto/
│
├── judging-step/          # سیستم تایید مراحل
│   ├── judging-step.module.ts
│   ├── judging-step.service.ts
│   ├── judging-step.resolver.ts
│   └── dto/
│
├── chat/                  # سیستم چت
│   ├── chat.module.ts
│   ├── chat.service.ts
│   ├── chat.resolver.ts
│   └── dto/
│
├── notification/          # سیستم اعلان‌ها
│   ├── notification.module.ts
│   ├── notification.service.ts
│   ├── notification.resolver.ts
│   └── dto/
│
├── attachment/            # مدیریت فایل‌ها و لینک‌ها
│   ├── attachment.module.ts
│   ├── attachment.service.ts
│   ├── attachment.resolver.ts
│   └── dto/
│
└── main.ts               # Entry Point
```

## 🔧 تنظیمات محیطی (.env)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/metaverse_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=3000

# File Upload
UPLOAD_DIR=./uploads
```

## 🗄 مدل‌های Database

### User
- نقش‌های: ADMIN, USER, JUDGE
- احراز هویت با رمز عبور hash شده (bcrypt)
- مدیریت آواتار

### Product
- ساختار درختی (Parent-Child)
- پیوست فایل و لینک

### Mission
- وضعیت‌ها: PENDING, IN_PROGRESS, JUDGING, NEEDS_FIX, DONE
- اولویت: URGENT, IMPORTANT, NORMAL
- تخصیص به کاربر
- مهلت انجام (Due Date)

### JudgingStep
- مراحل تایید هر ماموریت
- وضعیت‌ها: NOT_DONE, WAITING_JUDGE, NEEDS_FIX, APPROVED
- تخصیص به Judge

### ChatMessage
- چت مستقیم در ماموریت
- آپلود فایل

### Notification
- انواع: CHAT, APPROVAL, ASSIGNMENT, FIX
- خوانده/نخوانده

### Attachment
- انواع: FILE, LINK
- قابل اتصال به Product یا Mission

## 🚀 دستورات

### Development
```bash
# اجرا با Hot Reload
npm run start:dev

# اجرا با Debug Mode
npm run start:debug
```

### Build & Production
```bash
# Build
npm run build

# اجرای Production
npm run start:prod
```

### Database
```bash
# Generate Prisma Client
npm run prisma:generate

# اجرای Migrations
npm run prisma:migrate

# Prisma Studio (GUI)
npm run prisma:studio

# Seed Database
npm run prisma:seed

# Reset Database (خطرناک!)
npx prisma migrate reset
```

### Testing
```bash
# اجرای تست‌ها
npm run test

# Watch mode
npm run test:watch

# Coverage Report
npm run test:cov

# E2E Tests
npm run test:e2e
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format
```

## 🔐 احراز هویت

### Login
```graphql
mutation {
  login(phone: "09123456789", password: "password") {
    access_token
    user {
      id
      name
      role
    }
  }
}
```

### استفاده از Token
```
Authorization: Bearer <your-jwt-token>
```

## 📝 نمونه Queries

### دریافت لیست ماموریت‌ها
```graphql
query {
  missions {
    id
    title
    status
    priority
    dueDate
    assignee {
      name
      phone
    }
    product {
      title
    }
  }
}
```

### ایجاد ماموریت جدید
```graphql
mutation {
  createMission(input: {
    title: "ماموریت جدید"
    description: "شرح کامل ماموریت"
    assigneeId: 2
    productId: "prod-1"
    dueDate: "2026-03-01T12:00:00Z"
    priority: IMPORTANT
  }) {
    id
    title
    status
  }
}
```

### دریافت درخت محصولات
```graphql
query {
  products {
    id
    title
    children {
      id
      title
      children {
        id
        title
      }
    }
  }
}
```

## 📤 آپلود فایل

فایل‌ها از طریق REST API آپلود می‌شوند:

```bash
POST /attachment/upload
Content-Type: multipart/form-data

file: <your-file>
```

Response:
```json
{
  "id": "att-uuid",
  "name": "file.pdf",
  "url": "/uploads/file-uuid.pdf",
  "type": "FILE"
}
```

## 🔄 Event System

پروژه از Event Emitter استفاده می‌کند:

- **mission.created**: هنگام ایجاد ماموریت جدید
- **mission.updated**: هنگام بروزرسانی ماموریت
- **step.approved**: هنگام تایید یک مرحله
- **step.rejected**: هنگام رد یک مرحله
- **message.sent**: هنگام ارسال پیام

## 🛡 Guards و Decorators

### RolesGuard
محدود کردن دسترسی بر اساس نقش:

```typescript
@Roles('ADMIN', 'JUDGE')
@UseGuards(JwtAuthGuard, RolesGuard)
deleteProduct() { ... }
```

### CurrentUser Decorator
دریافت کاربر جاری:

```typescript
@Query()
myProfile(@CurrentUser() user: User) {
  return user;
}
```

## ⚠️ نکات مهم

1. **همیشه از JWT Guard استفاده کنید** (به جز login/register)
2. **Validation**: از DTOها برای اعتبارسنجی استفاده شود
3. **Error Handling**: خطاها به صورت استاندارد GraphQL برگردانده می‌شوند
4. **File Upload**: حداکثر سایز فایل 10MB
5. **Database Relations**: با Prisma cascade delete مدیریت می‌شود

## 🐛 Debugging

### Enable Debug Logs
```bash
npm run start:debug
```

### Prisma Query Logs
در `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

## 📊 Monitoring

### Health Check
```
GET /health
```

### Prisma Metrics
```bash
npm run prisma:studio
```

## 🔒 Security Checklist

- [x] رمزهای عبور با bcrypt هش می‌شوند
- [x] JWT برای احراز هویت
- [x] CORS تنظیم شده
- [x] Input Validation با class-validator
- [x] SQL Injection Protection (Prisma)
- [x] Rate Limiting (نیاز به پیاده‌سازی در Production)
- [x] Helmet برای Security Headers (نیاز به نصب)

## 📦 Dependencies مهم

```json
{
  "@nestjs/core": "^11.0.1",
  "@nestjs/graphql": "^13.0.0",
  "@nestjs/jwt": "^10.2.0",
  "@prisma/client": "^5.22.0",
  "bcrypt": "^5.1.1",
  "graphql": "^16.9.0",
  "passport-jwt": "^4.0.1"
}
```

## 🚀 Production Deployment

```bash
# Build
npm run build

# Set Environment
export NODE_ENV=production

# Run with PM2
pm2 start dist/main.js --name backend-api

# Monitor
pm2 logs backend-api
pm2 monit
```

## 📞 Support

در صورت بروز مشکل:
- بررسی logs: `npm run start:dev`
- بررسی دیتابیس: `npm run prisma:studio`
- بررسی GraphQL Playground: http://localhost:3000/graphql
