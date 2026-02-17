# راهنمای مشارکت در پروژه

ممنون که به مشارکت در این پروژه علاقه‌مند شدید! 🎉

## 📋 فهرست

- [Code of Conduct](#code-of-conduct)
- [نحوه مشارکت](#نحوه-مشارکت)
- [استانداردهای کد](#استانداردهای-کد)
- [پروسه Pull Request](#پروسه-pull-request)
- [گزارش باگ](#گزارش-باگ)
- [پیشنهاد ویژگی جدید](#پیشنهاد-ویژگی-جدید)

## 🤝 Code of Conduct

- محترمانه و حرفه‌ای رفتار کنید
- از انتقاد سازنده استفاده کنید
- به نظرات دیگران احترام بگذارید
- تمرکز بر بهترین راه‌حل برای پروژه

## 🔧 نحوه مشارکت

### 1. Fork و Clone

```bash
# Fork کنید از GitHub
git clone https://github.com/your-username/mvp.git
cd mvp
```

### 2. ایجاد Branch جدید

```bash
# برای feature جدید
git checkout -b feature/amazing-feature

# برای bug fix
git checkout -b fix/bug-description

# برای بهبود مستندات
git checkout -b docs/update-readme
```

### 3. نصب Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. انجام تغییرات

- تغییرات خود را اعمال کنید
- کد را test کنید
- مستندات را به‌روز کنید (در صورت نیاز)

### 5. Commit

```bash
git add .
git commit -m "feat: اضافه کردن ویژگی جدید"
```

### قوانین Commit Message

از conventional commits استفاده کنید:

```
feat: ویژگی جدید
fix: رفع باگ
docs: تغییر مستندات
style: تغییرات فرمت کد (بدون تغییر منطق)
refactor: بازنویسی کد
test: اضافه کردن تست
chore: تغییرات کلی (dependencies، config)
```

نمونه‌ها:
```
feat: اضافه کردن فیلتر پیشرفته در لیست ماموریت‌ها
fix: رفع مشکل آپلود فایل در چت
docs: به‌روزرسانی راهنمای نصب Backend
refactor: بهبود ساختار کامپوننت Dashboard
```

### 6. Push

```bash
git push origin feature/amazing-feature
```

### 7. ایجاد Pull Request

- برید به GitHub
- Pull Request باز کنید
- توضیحات کامل بدهید
- منتظر بررسی بمانید

## 💻 استانداردهای کد

### Backend (NestJS/TypeScript)

```typescript
// ✅ خوب
export class MissionService {
  async createMission(input: CreateMissionInput): Promise<Mission> {
    // validation
    if (!input.title) {
      throw new BadRequestException('عنوان الزامی است');
    }
    
    // business logic
    return await this.prisma.mission.create({
      data: input,
    });
  }
}

// ❌ بد
export class MissionService {
  async createMission(input) {
    return await this.prisma.mission.create({data:input});
  }
}
```

**قوانین:**
- از TypeScript types استفاده کنید
- DTOها برای validation
- Error handling مناسب
- Naming convention: camelCase
- Comment برای logic پیچیده

### Frontend (React/JavaScript)

```jsx
// ✅ خوب
function MissionCard({ mission, onUpdate }) {
  const [loading, setLoading] = useState(false);
  
  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await onUpdate(mission.id, { status: newStatus });
      showToast.success('وضعیت به‌روز شد');
    } catch (error) {
      showToast.error('خطا در به‌روزرسانی');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mission-card">
      {/* JSX */}
    </div>
  );
}

// ❌ بد
function MissionCard(props) {
  const handleStatusChange = (newStatus) => {
    props.onUpdate(props.mission.id, {status:newStatus});
  }
  return <div>{/* JSX */}</div>
}
```

**قوانین:**
- Component names: PascalCase
- Function names: camelCase
- استفاده از PropTypes یا TypeScript
- Loading و Error states
- TailwindCSS برای styling
- Comment برای logic پیچیده

### قوانین عمومی

1. **DRY**: Don't Repeat Yourself
2. **KISS**: Keep It Simple, Stupid
3. **SOLID Principles**: به خصوص Single Responsibility
4. **Clean Code**: نام‌گذاری معنادار
5. **Comments**: فقط برای توضیح "چرا" نه "چه"

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# اگر تست نوشتید
npm run test
```

**تست‌های الزامی:**
- تست برای business logic مهم
- تست برای API endpoints جدید
- تست برای کامپوننت‌های پیچیده

## 📝 پروسه Pull Request

### Checklist قبل از PR

- [ ] کد را test کردم
- [ ] Linting errors ندارم (`npm run lint`)
- [ ] مستندات را به‌روز کردم
- [ ] Commit messages استاندارد هستند
- [ ] Branch از master به‌روز است
- [ ] تست‌ها pass می‌شوند
- [ ] تغییرات breaking نیست (یا مستند شده)

### قالب Pull Request

```markdown
## توضیحات
توضیح کوتاه از تغییرات

## نوع تغییرات
- [ ] Bug fix
- [ ] Feature جدید
- [ ] Breaking change
- [ ] مستندات

## چگونه تست شده؟
- [ ] Manual testing
- [ ] Unit tests
- [ ] Integration tests

## Screenshots (در صورت نیاز)
(اسکرین‌شات قبل و بعد)

## Checklist
- [ ] کد lint شده
- [ ] تست‌ها pass می‌شوند
- [ ] مستندات به‌روز شده
```

### پروسه Review

1. حداقل یک reviewer تایید کند
2. تمام comments حل شوند
3. تست‌ها pass باشند
4. Merge توسط maintainer

## 🐛 گزارش باگ

برای گزارش باگ، Issue باز کنید با این فرمت:

```markdown
## توضیحات باگ
توضیح واضح و مختصر

## مراحل بازتولید
1. برو به '...'
2. کلیک کن روی '...'
3. خطا را ببین

## رفتار مورد انتظار
چه اتفاقی باید می‌افتاد

## رفتار واقعی
چه اتفاقی افتاد

## Screenshots
(در صورت امکان)

## محیط
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node Version: [e.g. 18.17]

## اطلاعات اضافی
هر چیز دیگری که مفید باشد
```

## 💡 پیشنهاد ویژگی جدید

برای پیشنهاد feature، Issue باز کنید با این فرمت:

```markdown
## مشکل/نیاز
توضیح مشکل یا نیاز موجود

## راه‌حل پیشنهادی
توضیح feature پیشنهادی

## راه‌حل‌های جایگزین
راه‌حل‌های دیگری که در نظر گرفتید

## اطلاعات اضافی
Context، مثال‌ها، mockup‌ها
```

## 🎯 اولویت‌های پروژه

### High Priority
- رفع باگ‌های critical
- مشکلات امنیتی
- مشکلات performance

### Medium Priority
- ویژگی‌های جدید
- بهبود UX
- بهینه‌سازی

### Low Priority
- Refactoring
- مستندات
- تست‌های بیشتر

## 📞 ارتباط

- **Issues**: برای باگ و feature request
- **Discussions**: برای سوالات عمومی
- **Email**: برای موارد خصوصی

## 🙏 تشکر

هر مشارکت، هر چقدر هم کوچک، ارزشمند است!

از شما برای بهبود این پروژه متشکریم. 🚀
