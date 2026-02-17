# Changelog

تمام تغییرات مهم پروژه در این فایل مستند می‌شود.

فرمت بر اساس [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) است.

## [Unreleased]

### در حال توسعه
- بهبودهای آینده اینجا لیست می‌شوند

---

## [0.1.0] - 2026-02-17

### 🎉 نسخه اولیه (Initial Release)

#### ✨ Added - Backend

**Authentication & User Management**
- سیستم احراز هویت با JWT
- نقش‌های کاربری: Admin, User, Judge
- رمزنگاری با bcrypt
- مدیریت پروفایل کاربر

**Product Management**
- ساختار درختی محصولات (Parent-Child)
- CRUD کامل برای محصولات
- پیوست فایل و لینک به محصولات

**Mission Management**
- ایجاد و مدیریت ماموریت‌ها
- وضعیت‌ها: Pending, In Progress, Judging, Needs Fix, Done
- اولویت‌بندی: Urgent, Important, Normal
- تخصیص ماموریت به کاربران
- تاریخ سررسید (Due Date)

**Judging System**
- مراحل تایید قابل تعریف برای هر ماموریت
- وضعیت‌های مراحل: Not Done, Waiting Judge, Needs Fix, Approved
- تخصیص مراحل به داوران مختلف

**Chat System**
- چت مستقیم در ماموریت‌ها
- آپلود فایل در چت
- نمایش تاریخچه پیام‌ها

**Notification System**
- اعلان‌های خودکار برای رویدادها
- انواع: Chat, Approval, Assignment, Fix
- وضعیت خوانده/نخوانده

**File Management**
- آپلود فایل با Multer
- پشتیبانی از انواع فایل
- لینک‌های مرتبط

**Technical Stack**
- NestJS 11.0.1
- GraphQL با Apollo Server 4.11.0
- Prisma 5.22.0 + PostgreSQL
- TypeScript 5.7.3
- Passport JWT

#### ✨ Added - Frontend

**User Interface**
- Dashboard با نمایش آمار کلی
- صفحه لیست محصولات با نمای درختی
- صفحه لیست ماموریت‌ها با فیلتر
- صفحه جزئیات ماموریت
- صفحه پروفایل کاربر

**Authentication**
- صفحه لاگین
- مدیریت توکن JWT
- Protected Routes

**Features**
- نمایش درختی محصولات
- فیلتر و جستجوی ماموریت‌ها
- تغییر وضعیت ماموریت
- چت در ماموریت با آپلود فایل
- سیستم نوتیفیکیشن

**UI/UX**
- طراحی Responsive
- Dark/Light Mode (در صورت پیاده‌سازی)
- TailwindCSS برای styling
- Lucide Icons
- Toast Notifications

**Internationalization**
- پشتیبانی از فارسی و انگلیسی
- سیستم i18n

**Technical Stack**
- React 19.2.0
- Vite 7.3.1
- Apollo Client 4.1.4
- React Router v7.13.0
- TailwindCSS 3.4.19

#### 📚 Documentation

- README.md اصلی با راهنمای کامل
- README.md جداگانه برای Backend
- README.md جداگانه برای Frontend
- CONTRIBUTING.md برای راهنمای مشارکت
- .env.example برای تنظیمات محیطی
- CHANGELOG.md (این فایل)

#### 🔧 Configuration

- .gitignore برای root، backend و frontend
- ESLint configuration
- Prettier configuration
- Prisma schema با تمام models
- TailwindCSS configuration
- Vite configuration

#### 🗄 Database Schema

**Models:**
- User (کاربران)
- Product (محصولات)
- Mission (ماموریت‌ها)
- JudgingStep (مراحل تایید)
- ChatMessage (پیام‌های چت)
- Notification (اعلان‌ها)
- Attachment (پیوست‌ها)

**Relations:**
- User → Missions (one-to-many)
- Product → Missions (one-to-many)
- Product → Product (self-relation, tree structure)
- Mission → JudgingSteps (one-to-many)
- Mission → ChatMessages (one-to-many)
- Mission → Notifications (one-to-many)

---

## نحوه استفاده از Changelog

### Format

```markdown
## [Version] - YYYY-MM-DD

### Added
- ویژگی‌های جدید

### Changed
- تغییرات در ویژگی‌های موجود

### Deprecated
- ویژگی‌هایی که به زودی حذف می‌شوند

### Removed
- ویژگی‌های حذف شده

### Fixed
- باگ‌های رفع شده

### Security
- رفع مشکلات امنیتی
```

### Version Numbering (Semantic Versioning)

- **MAJOR** (1.0.0): تغییرات breaking
- **MINOR** (0.1.0): ویژگی‌های جدید (backward compatible)
- **PATCH** (0.0.1): رفع باگ (backward compatible)

---

## نسخه‌های آینده (Planned)

### [0.2.0] - Planned

**Planned Features:**
- [ ] Real-time notifications با WebSocket
- [ ] پشتیبانی از چند زبان بیشتر
- [ ] Export/Import داده‌ها
- [ ] Dashboard پیشرفته‌تر با نمودارها
- [ ] Search پیشرفته
- [ ] فیلترهای پیشرفته‌تر
- [ ] History/Timeline برای ماموریت‌ها
- [ ] Bulk operations
- [ ] API rate limiting
- [ ] Caching layer

### [0.3.0] - Planned

**Planned Features:**
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Advanced analytics
- [ ] Report generation (PDF, Excel)
- [ ] Calendar view
- [ ] Gantt chart
- [ ] Time tracking
- [ ] Integration با سرویس‌های third-party

---

## Contributors

- Initial Development Team

---

**برای اطلاعات بیشتر:**
- [README.md](./README.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
