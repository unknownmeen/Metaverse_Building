# Frontend - Metaverse Project Management

رابط کاربری (UI) مدیریت پروژه با React و TailwindCSS.

## 🛠 تکنولوژی‌ها

- **React 19**: کتابخانه UI
- **Vite 7**: Build Tool سریع و مدرن
- **React Router v7**: مدیریت Routing
- **Apollo Client**: GraphQL Client
- **TailwindCSS 3**: Utility-First CSS Framework
- **Lucide React**: آیکون‌های مدرن
- **i18n**: چندزبانه (فارسی/انگلیسی)

## 📋 ساختار پروژه

```
src/
├── components/              # کامپوننت‌های قابل استفاده مجدد
│   ├── common/             # کامپوننت‌های عمومی
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── LoadingSpinner.jsx
│   ├── layout/             # Layout Components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   └── features/           # Feature-specific Components
│       ├── MissionCard.jsx
│       ├── ProductTree.jsx
│       └── ChatBox.jsx
│
├── pages/                  # صفحات اصلی
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── Missions.jsx
│   ├── Mission.jsx         # جزئیات ماموریت
│   └── Profile.jsx
│
├── services/               # سرویس‌ها
│   ├── api.js             # API Configuration
│   ├── authService.js     # احراز هویت
│   ├── apolloClient.js    # Apollo Setup
│   ├── toastService.js    # نوتیفیکیشن‌ها
│   └── i18n.js            # چندزبانه
│
├── graphql/               # GraphQL Queries & Mutations
│   ├── queries/
│   │   ├── missions.js
│   │   ├── products.js
│   │   └── users.js
│   └── mutations/
│       ├── createMission.js
│       ├── updateMission.js
│       └── login.js
│
├── hooks/                 # Custom React Hooks
│   ├── useAuth.js
│   ├── useMissions.js
│   └── useToast.js
│
├── utils/                 # توابع کمکی
│   ├── dateUtils.js
│   ├── validators.js
│   └── formatters.js
│
├── locales/              # فایل‌های ترجمه
│   ├── fa.json          # فارسی
│   └── en.json          # انگلیسی
│
├── data/                 # Mock Data (Development)
│   └── mockData.js
│
├── styles/              # استایل‌های سراسری
│   └── index.css
│
├── App.jsx              # کامپوننت اصلی
└── main.jsx            # Entry Point
```

## 🔧 تنظیمات محیطی (.env)

```env
VITE_API_URL=http://localhost:3000
VITE_GRAPHQL_URL=http://localhost:3000/graphql
```

## 🚀 دستورات

### Development
```bash
# اجرای Dev Server
npm run dev
# Frontend در http://localhost:5173 اجرا می‌شود
```

### Build
```bash
# Build برای Production
npm run build

# فایل‌های build در پوشه dist/ قرار می‌گیرند
```

### Preview
```bash
# پیش‌نمایش Build شده
npm run preview
```

### Code Quality
```bash
# Linting
npm run lint
```

## 🎨 طراحی و UI/UX

### تم و رنگ‌بندی

پروژه از TailwindCSS با تنظیمات سفارشی استفاده می‌کند:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...},
      accent: {...}
    }
  }
}
```

### Responsive Design
- **Mobile First**: طراحی برای موبایل در اولویت
- **Breakpoints**: sm, md, lg, xl, 2xl
- تمام صفحات کاملا responsive هستند

## 🔐 احراز هویت

### Login Flow

```javascript
import { login } from './services/authService';

const handleLogin = async (phone, password) => {
  try {
    const { token, user } = await login(phone, password);
    // Token در localStorage ذخیره می‌شود
    // Redirect به Dashboard
  } catch (error) {
    // نمایش خطا
  }
};
```

### Protected Routes

```jsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### Logout

```javascript
import { logout } from './services/authService';

logout(); // حذف token و redirect به login
```

## 📡 ارتباط با Backend (Apollo Client)

### Setup

```javascript
// services/apolloClient.js
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_URL,
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${token}`
  }
});
```

### نمونه Query

```javascript
import { useQuery } from '@apollo/client';
import { GET_MISSIONS } from '../graphql/queries/missions';

function MissionList() {
  const { loading, error, data } = useQuery(GET_MISSIONS);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {data.missions.map(mission => (
        <MissionCard key={mission.id} mission={mission} />
      ))}
    </div>
  );
}
```

### نمونه Mutation

```javascript
import { useMutation } from '@apollo/client';
import { CREATE_MISSION } from '../graphql/mutations/createMission';

function CreateMissionForm() {
  const [createMission, { loading }] = useMutation(CREATE_MISSION);
  
  const handleSubmit = async (formData) => {
    try {
      const { data } = await createMission({
        variables: { input: formData }
      });
      // Success handling
    } catch (error) {
      // Error handling
    }
  };
}
```

## 🌍 چندزبانه (i18n)

### استفاده از ترجمه‌ها

```javascript
import { useTranslation } from './services/i18n';

function Component() {
  const { t, locale, setLocale } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.welcome')}</h1>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('fa')}>فارسی</button>
    </div>
  );
}
```

### اضافه کردن ترجمه جدید

در `locales/fa.json`:
```json
{
  "dashboard": {
    "welcome": "خوش آمدید",
    "missions": "ماموریت‌ها"
  }
}
```

## 🎯 قابلیت‌های اصلی

### 1. Dashboard
- نمایش آمار کلی
- ماموریت‌های اخیر
- نوتیفیکیشن‌ها

### 2. مدیریت محصولات
- نمایش درختی محصولات
- افزودن/ویرایش/حذف
- مدیریت پیوست‌ها

### 3. مدیریت ماموریت‌ها
- لیست ماموریت‌ها با فیلتر
- ایجاد ماموریت جدید
- تخصیص به کاربر
- تغییر وضعیت
- نمایش جزئیات کامل

### 4. سیستم چت
- چت realtime در ماموریت
- آپلود فایل
- نمایش تاریخچه پیام‌ها

### 5. سیستم Judging
- مشاهده مراحل تایید
- تایید/رد مراحل
- افزودن نظر

### 6. نوتیفیکیشن‌ها
- دریافت اعلان‌ها
- علامت‌گذاری به عنوان خوانده شده
- پاک کردن اعلان‌ها

## 🔔 Toast Notifications

```javascript
import { showToast } from './services/toastService';

// Success
showToast.success('عملیات با موفقیت انجام شد');

// Error
showToast.error('خطایی رخ داده است');

// Warning
showToast.warning('هشدار!');

// Info
showToast.info('اطلاعیه');
```

## 📤 آپلود فایل

```javascript
import { uploadFile } from './services/api';

const handleFileUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadFile(formData);
    console.log('Uploaded:', result.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## 🎨 کامپوننت‌های مشترک

### Button

```jsx
<Button 
  variant="primary" 
  size="md" 
  onClick={handleClick}
  loading={isLoading}
>
  ذخیره
</Button>
```

### Input

```jsx
<Input 
  label="نام"
  placeholder="نام خود را وارد کنید"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={errors.name}
/>
```

### Modal

```jsx
<Modal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="عنوان مودال"
>
  <div>محتوای مودال</div>
</Modal>
```

## 🧪 Mock Data

در حالت Development، از mock data استفاده می‌شود:

```javascript
// src/data/mockData.js
export const mockMissions = [...];
export const mockProducts = [...];
```

برای غیرفعال کردن mock mode:
- Backend را روشن کنید
- فایل `.env` را تنظیم کنید

## 🎭 State Management

پروژه از **React Context API** برای مدیریت state استفاده می‌کند:

```jsx
// AuthContext
<AuthProvider>
  <App />
</AuthProvider>

// در کامپوننت‌ها:
const { user, isAuthenticated } = useAuth();
```

## 🚀 بهینه‌سازی Performance

### Code Splitting
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### Memoization
```javascript
const memoizedValue = useMemo(() => 
  computeExpensiveValue(a, b), 
  [a, b]
);
```

### Virtual Scrolling
برای لیست‌های بزرگ از virtualization استفاده شود.

## 📱 PWA (Progressive Web App)

پروژه آماده تبدیل به PWA:
1. Service Worker اضافه کنید
2. manifest.json تنظیم کنید
3. آیکون‌ها را اضافه کنید

## 🐛 Debugging

### React DevTools
نصب کنید:
- Chrome Extension
- Firefox Add-on

### Apollo Client DevTools
برای debug کردن queries و cache

### Console Logs
```javascript
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

## 🔒 Security Best Practices

- ✅ XSS Protection: React automatically escapes
- ✅ CSRF: توکن JWT در header
- ✅ Secure Storage: توکن در localStorage (برای production httpOnly cookie بهتر است)
- ✅ Input Validation: client-side و server-side
- ✅ HTTPS Only: در production

## 📦 Build و Deploy

### Build برای Production

```bash
npm run build
```

فایل‌های build شده:
- `dist/index.html`
- `dist/assets/` (JS, CSS, Images)

### Deploy روی Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Deploy روی Vercel

```bash
# نصب Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables در Production

متغیرها را در پلتفرم deploy تنظیم کنید:
- Vercel: Project Settings > Environment Variables
- Netlify: Site Settings > Build & Deploy > Environment

## 📊 Analytics (اختیاری)

### Google Analytics

```javascript
// در main.jsx یا App.jsx
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
```

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Apollo Client](https://www.apollographql.com/docs/react)
- [React Router](https://reactrouter.com)

## 📞 Support

در صورت بروز مشکل:
- بررسی Console Browser
- بررسی Network Tab
- بررسی Apollo DevTools
- مطالعه Error Stack Trace

---

**ساخته شده با ❤️ و React**
