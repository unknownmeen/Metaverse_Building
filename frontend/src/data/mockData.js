export const avatarList = [
  { id: 'av1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ali', name: 'آواتار ۱' },
  { id: 'av2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sara', name: 'آواتار ۲' },
  { id: 'av3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Reza', name: 'آواتار ۳' },
  { id: 'av4', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mina', name: 'آواتار ۴' },
  { id: 'av5', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Hossein', name: 'آواتار ۵' },
  { id: 'av6', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zahra', name: 'آواتار ۶' },
  { id: 'av7', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Amir', name: 'آواتار ۷' },
  { id: 'av8', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Narges', name: 'آواتار ۸' },
];

export const users = [
  { id: 1, name: 'علی احمدی', avatar: avatarList[0].url, role: 'admin' },
  { id: 2, name: 'محمد رضایی', avatar: avatarList[1].url, role: 'user' },
  { id: 3, name: 'فاطمه محمدی', avatar: avatarList[2].url, role: 'user' },
  { id: 4, name: 'حسین کریمی', avatar: avatarList[3].url, role: 'judge' },
  { id: 5, name: 'زهرا حسینی', avatar: avatarList[4].url, role: 'judge' },
  { id: 6, name: 'امیر موسوی', avatar: avatarList[5].url, role: 'user' },
];

export const currentUser = {
  id: 1,
  name: 'علی احمدی',
  phone: '۰۹۱۲۳۴۵۶۷۸۹',
  avatar: avatarList[0].url,
  avatarId: 'av1',
  role: 'admin',
  password: '۱۲۳۴۵۶',
};

export const MISSION_STATUS = {
  PENDING: { key: 'pending', label: 'در انتظار پذیرفتن', color: '#94a3b8', bg: '#f1f5f9', border: '#cbd5e1' },
  IN_PROGRESS: { key: 'in_progress', label: 'در حال انجام', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
  JUDGING: { key: 'judging', label: 'در حال داوری', color: '#eab308', bg: '#fefce8', border: '#fde047' },
  NEEDS_FIX: { key: 'needs_fix', label: 'نیازمند اصلاح', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
  DONE: { key: 'done', label: 'انجام شده', color: '#22c55e', bg: '#f0fdf4', border: '#86efac' },
};

export const STEP_STATUS = {
  NOT_DONE: { key: 'not_done', label: 'انجام نشده', color: '#94a3b8', bg: '#f1f5f9' },
  WAITING_JUDGE: { key: 'waiting_judge', label: 'منتظر داوری', color: '#eab308', bg: '#fefce8' },
  NEEDS_FIX: { key: 'needs_fix', label: 'نیازمند اصلاح', color: '#ef4444', bg: '#fef2f2' },
  APPROVED: { key: 'approved', label: 'تأیید شده', color: '#22c55e', bg: '#f0fdf4' },
};

export const PRIORITY = {
  URGENT: { key: 'urgent', label: 'فوری', color: '#ef4444', bg: '#fef2f2' },
  IMPORTANT: { key: 'important', label: 'مهم', color: '#f59e0b', bg: '#fffbeb' },
  NORMAL: { key: 'normal', label: 'عادی', color: '#6366f1', bg: '#eef2ff' },
};

function makeMission(id, title, assignee, status, priority, description, dueDate, steps = [], chat = []) {
  return {
    type: 'mission',
    id,
    title,
    assignee,
    createdAt: '۱۴۰۴/۱۱/۰۱',
    dueDate: dueDate || '۱۴۰۴/۱۲/۱۵',
    priority: priority || 'normal',
    description: description || '',
    status: status || 'pending',
    judgingSteps: steps,
    attachments: [],
    chat: chat,
  };
}

export const rootProduct = {
  id: 'root',
  title: 'پروژه امام (ع)',
  description: '',
  attachments: [],
  children: [
    // ═══════════════════════════════════════════
    // ۱) آتلیه حاج حمید — محصول بزرگ اصلی
    // ═══════════════════════════════════════════
    {
      type: 'product',
      id: 'p-atelier',
      title: 'آتلیه حاج حمید',
      description: 'مجموعه فعالیت‌های هنری، فرهنگی و تولید محتوای آتلیه حاج حمید',
      attachments: [],
      children: [
        // --- زیرمحصول ۱: در محضر ---
        {
          type: 'product',
          id: 'p-dar-mahzar',
          title: 'در محضر',
          description: 'پروژه تولید محتوای ویدئویی در محضر',
          attachments: [],
          children: [
            makeMission('m-sahne', 'پیاده‌سازی و چینش صحنه', 2, 'in_progress', 'urgent',
              'چینش کامل صحنه شامل نورپردازی، دکور و تجهیزات فیلمبرداری',
              '۱۴۰۴/۱۲/۱۰',
              [
                { id: 'js1', title: 'بررسی طرح صحنه', judgeId: 4, status: 'approved' },
                { id: 'js2', title: 'تأیید نهایی چینش', judgeId: 5, status: 'waiting_judge' },
              ],
              [
                { id: 'c1', senderId: 2, text: 'طرح اولیه صحنه آماده شد، لطفاً بررسی کنید.', time: '۱۰:۳۰', file: null },
                { id: 'c2', senderId: 4, text: 'طرح خوبه، نورپردازی سمت راست نیاز به تنظیم داره.', time: '۱۱:۴۵', file: null },
              ]
            ),
            makeMission('m-optimize', 'بهینه‌سازی در مبدأ', 3, 'judging', 'important',
              'بهینه‌سازی فایل‌های خام تصویری و ویدئویی در مبدأ تولید',
              '۱۴۰۴/۱۲/۰۵',
              [
                { id: 'js3', title: 'بررسی کیفیت خروجی', judgeId: 4, status: 'waiting_judge' },
              ],
              [
                { id: 'c3', senderId: 3, text: 'فایل‌های بهینه‌سازی شده آماده‌اند.', time: '۰۹:۰۰', file: { name: 'optimized_files.zip', url: '#' } },
              ]
            ),
            makeMission('m-sound', 'صداگذاری موسیقی', 6, 'pending', 'normal',
              'انتخاب و صداگذاری موسیقی متناسب با فضای محتوا',
              '۱۴۰۴/۱۲/۲۰',
              [
                { id: 'js4', title: 'تأیید انتخاب موسیقی', judgeId: 5, status: 'not_done' },
              ],
              []
            ),
          ],
        },
        // --- زیرمحصول ۲: تالار سوره صف ---
        {
          type: 'product',
          id: 'p-talar-saf',
          title: 'تالار سوره صف',
          description: 'طراحی و اجرای فضای تالار سوره صف',
          attachments: [],
          children: [
            {
              type: 'product',
              id: 'p-ketab-saf',
              title: 'کتاب سوره صف',
              description: 'تولید و طراحی کتاب سوره صف',
              attachments: [],
              children: [
                makeMission('m-ketab-design', 'طراحی صفحه‌آرایی کتاب', 6, 'in_progress', 'urgent',
                  'صفحه‌آرایی کامل کتاب شامل جلد، صفحات داخلی و تصاویر',
                  '۱۴۰۴/۱۲/۰۱',
                  [{ id: 'js5', title: 'بررسی طرح جلد', judgeId: 4, status: 'approved' }],
                  [{ id: 'c4', senderId: 6, text: 'طرح جلد نهایی شد.', time: '۱۴:۰۰', file: { name: 'cover_final.pdf', url: '#' } }]
                ),
                makeMission('m-ketab-print', 'هماهنگی چاپ', 3, 'pending', 'normal',
                  'هماهنگی با چاپخانه برای چاپ نسخه اول',
                  '۱۴۰۵/۰۱/۱۵',
                  [],
                  []
                ),
              ],
            },
            makeMission('m-talar-decor', 'طراحی دکور تالار', 2, 'done', 'important',
              'طراحی دکوراسیون داخلی تالار سوره صف',
              '۱۴۰۴/۱۱/۲۰',
              [{ id: 'js6', title: 'تأیید طرح نهایی', judgeId: 5, status: 'approved' }],
              [
                { id: 'c5', senderId: 2, text: 'طرح نهایی دکور آماده شد.', time: '۱۶:۰۰', file: { name: 'decor_plan.pdf', url: '#' } },
                { id: 'c6', senderId: 5, text: 'عالیه! تأیید شد.', time: '۱۷:۰۰', file: null },
              ]
            ),
          ],
        },
        // --- زیرمحصول ۳: گالری حاج حمید ---
        {
          type: 'product',
          id: 'p-gallery',
          title: 'گالری حاج حمید',
          description: 'مدیریت و برگزاری نمایشگاه‌های هنری گالری',
          attachments: [],
          children: [
            makeMission('m-gallery-setup', 'چیدمان آثار گالری', 6, 'in_progress', 'urgent',
              'چیدمان و نصب آثار هنری در فضای گالری',
              '۱۴۰۴/۱۲/۰۱',
              [
                { id: 'js7', title: 'بررسی نقشه چیدمان', judgeId: 4, status: 'approved' },
                { id: 'js8', title: 'تأیید نهایی', judgeId: 5, status: 'not_done' },
              ],
              []
            ),
            makeMission('m-gallery-invite', 'طراحی دعوتنامه نمایشگاه', 3, 'done', 'normal',
              'طراحی و چاپ دعوتنامه‌های نمایشگاه',
              '۱۴۰۴/۱۱/۲۵',
              [{ id: 'js9', title: 'تأیید طرح', judgeId: 4, status: 'approved' }],
              []
            ),
          ],
        },
        // --- زیرمحصول ۴: نمایشگاه فلسطین ---
        {
          type: 'product',
          id: 'p-exhibition',
          title: 'نمایشگاه فلسطین',
          description: 'برگزاری نمایشگاه هنری با موضوع فلسطین',
          attachments: [],
          children: [
            {
              type: 'product',
              id: 'p-tablo-falestin',
              title: 'تابلوهای فلسطین',
              description: 'مجموعه تابلوهای هنری با موضوع فلسطین',
              attachments: [],
              children: [
                makeMission('m-tablo-sketch', 'طراحی اسکچ تابلوها', 2, 'done', 'urgent',
                  'طراحی اسکچ اولیه ۵ تابلو با موضوع مقاومت',
                  '۱۴۰۴/۱۱/۱۵',
                  [{ id: 'js10', title: 'تأیید اسکچ‌ها', judgeId: 5, status: 'approved' }],
                  []
                ),
                makeMission('m-tablo-paint', 'اجرای نقاشی روی بوم', 2, 'in_progress', 'important',
                  'اجرای نقاشی نهایی روی بوم‌های ۲×۳ متری',
                  '۱۴۰۴/۱۲/۲۰',
                  [{ id: 'js11', title: 'بررسی پیشرفت', judgeId: 4, status: 'waiting_judge' }],
                  []
                ),
              ],
            },
            makeMission('m-exhibition-poster', 'طراحی پوستر نمایشگاه', 6, 'needs_fix', 'important',
              'طراحی پوستر تبلیغاتی نمایشگاه فلسطین',
              '۱۴۰۴/۱۲/۰۱',
              [{ id: 'js12', title: 'بررسی طراحی', judgeId: 5, status: 'needs_fix' }],
              [
                { id: 'c7', senderId: 6, text: 'نسخه دوم پوستر آماده شد.', time: '۱۱:۰۰', file: { name: 'poster_v2.png', url: '#' } },
                { id: 'c8', senderId: 5, text: 'رنگ‌بندی اصلاح بشه، از تُن‌های گرم‌تر استفاده کنید.', time: '۱۴:۰۰', file: null },
              ]
            ),
          ],
        },
        // --- زیرمحصول ۵: استودیو ضبط ---
        {
          type: 'product',
          id: 'p-studio',
          title: 'استودیو ضبط',
          description: 'استودیو ضبط صدا و تصویر آتلیه',
          attachments: [],
          children: [
            makeMission('m-studio-acoustic', 'عایق‌بندی صوتی استودیو', 2, 'done', 'urgent',
              'نصب پنل‌های آکوستیک و عایق‌بندی صوتی',
              '۱۴۰۴/۱۱/۱۰',
              [{ id: 'js13', title: 'تأیید کیفیت صدا', judgeId: 4, status: 'approved' }],
              []
            ),
            makeMission('m-studio-equip', 'تهیه تجهیزات ضبط', 3, 'in_progress', 'important',
              'خرید میکروفن، کارت صدا و تجهیزات ضبط حرفه‌ای',
              '۱۴۰۴/۱۲/۰۱',
              [{ id: 'js14', title: 'بررسی لیست خرید', judgeId: 5, status: 'approved' }],
              [{ id: 'c9', senderId: 3, text: 'لیست تجهیزات و قیمت‌ها آماده شد.', time: '۰۸:۰۰', file: { name: 'equipment_list.xlsx', url: '#' } }]
            ),
          ],
        },
      ],
    },
    // ═══════════════════════════════════════════
    // ۲) پلتفرم متاورس — محصول بزرگ اصلی
    // ═══════════════════════════════════════════
    {
      type: 'product',
      id: 'p-metaverse',
      title: 'پلتفرم متاورس',
      description: 'توسعه پلتفرم متاورس و واقعیت مجازی',
      attachments: [],
      children: [
        makeMission('m-character', 'کاراکتر انسانی و نوری', 2, 'in_progress', 'urgent',
          'طراحی و پیاده‌سازی کاراکترهای انسانی و جلوه‌های نوری در محیط متاورس',
          '۱۴۰۴/۱۲/۱۵',
          [
            { id: 'js15', title: 'بررسی مدل‌سازی', judgeId: 4, status: 'approved' },
            { id: 'js16', title: 'بررسی انیمیشن', judgeId: 5, status: 'waiting_judge' },
          ],
          [
            { id: 'c10', senderId: 2, text: 'مدل کاراکتر اصلی آماده شد.', time: '۱۵:۰۰', file: { name: 'character_model.fbx', url: '#' } },
            { id: 'c11', senderId: 4, text: 'مدل‌سازی تأیید شد. انیمیشن رو ادامه بدید.', time: '۱۶:۳۰', file: null },
          ]
        ),
        makeMission('m-multiplayer', 'بحث مولتی پلیر', 3, 'in_progress', 'urgent',
          'پیاده‌سازی سیستم چندنفره و همزمان در محیط متاورس',
          '۱۴۰۴/۱۲/۲۰',
          [{ id: 'js17', title: 'بررسی معماری شبکه', judgeId: 4, status: 'approved' }],
          [{ id: 'c12', senderId: 3, text: 'معماری شبکه نهایی شد.', time: '۱۰:۰۰', file: { name: 'network_arch.pdf', url: '#' } }]
        ),
        makeMission('m-voice', 'بحث ارتباط صوتی', 6, 'pending', 'important',
          'پیاده‌سازی سیستم ارتباط صوتی بلادرنگ بین کاربران',
          '۱۴۰۵/۰۱/۰۱',
          [{ id: 'js18', title: 'بررسی فنی', judgeId: 5, status: 'not_done' }],
          []
        ),
        makeMission('m-scenes', 'اتصال صحنه‌ها به هم', 2, 'judging', 'important',
          'پیاده‌سازی سیستم انتقال و اتصال صحنه‌های مختلف متاورس به یکدیگر',
          '۱۴۰۴/۱۲/۱۰',
          [
            { id: 'js19', title: 'بررسی لودینگ', judgeId: 4, status: 'approved' },
            { id: 'js20', title: 'تست عملکرد', judgeId: 5, status: 'waiting_judge' },
          ],
          [
            { id: 'c13', senderId: 2, text: 'سیستم انتقال صحنه پیاده شد، لطفاً تست کنید.', time: '۱۳:۰۰', file: null },
          ]
        ),
        makeMission('m-vr-optim', 'آپتیمایزشن کلی لول برای VR', 3, 'in_progress', 'urgent',
          'بهینه‌سازی عملکرد کلی لول‌ها برای اجرای روان روی هدست‌های VR',
          '۱۴۰۴/۱۲/۲۵',
          [{ id: 'js21', title: 'بررسی فریم‌ریت', judgeId: 4, status: 'waiting_judge' }],
          [{ id: 'c14', senderId: 3, text: 'فریم‌ریت به ۷۲ رسید، هدف ۹۰ هست.', time: '۱۱:۰۰', file: null }]
        ),
        makeMission('m-auth', 'بحث احراز هویت', 6, 'pending', 'normal',
          'پیاده‌سازی سیستم احراز هویت و مدیریت کاربران',
          '۱۴۰۵/۰۱/۱۵',
          [{ id: 'js22', title: 'بررسی معماری', judgeId: 5, status: 'not_done' }],
          []
        ),
      ],
    },
    // ═══════════════════════════════════════════
    // ۳) محصولات کناری — محصول بزرگ اصلی
    // ═══════════════════════════════════════════
    {
      type: 'product',
      id: 'p-side',
      title: 'محصولات کناری',
      description: 'محصولات و پروژه‌های جانبی و پشتیبان',
      attachments: [],
      children: [
        // --- زیرمحصول: اَست منیجمنت ---
        {
          type: 'product',
          id: 'p-asset-mgmt',
          title: 'اَست منیجمنت',
          description: 'سیستم مدیریت دارایی‌های دیجیتال پروژه',
          attachments: [],
          children: [
            makeMission('m-web-research', 'تحقیق و توسعه در رابطه با ساختار وب', 3, 'in_progress', 'important',
              'بررسی و تحقیق روی ساختار وب مناسب برای سیستم مدیریت دارایی',
              '۱۴۰۴/۱۲/۱۵',
              [{ id: 'js23', title: 'بررسی گزارش تحقیق', judgeId: 4, status: 'approved' }],
              [{ id: 'c15', senderId: 3, text: 'گزارش تحقیقاتی آماده شد.', time: '۰۹:۰۰', file: { name: 'research_report.pdf', url: '#' } }]
            ),
            makeMission('m-mvp-launch', 'بالا آوردن نسخه اولیه', 2, 'in_progress', 'urgent',
              'پیاده‌سازی و راه‌اندازی نسخه اولیه (MVP) سیستم اَست منیجمنت',
              '۱۴۰۴/۱۲/۲۰',
              [
                { id: 'js24', title: 'بررسی بک‌اند', judgeId: 4, status: 'approved' },
                { id: 'js25', title: 'بررسی فرانت‌اند', judgeId: 5, status: 'waiting_judge' },
              ],
              [
                { id: 'c16', senderId: 2, text: 'بک‌اند MVP آماده شد.', time: '۱۴:۰۰', file: null },
                { id: 'c17', senderId: 4, text: 'بک‌اند تأیید شد.', time: '۱۵:۳۰', file: null },
              ]
            ),
          ],
        },
        // --- مأموریت PCG مستقیماً زیر محصولات کناری ---
        makeMission('m-pcg', 'تحقیق و توسعه روی ابزارک‌های PCG', 6, 'judging', 'important',
          'بررسی و پیاده‌سازی ابزارک‌های Procedural Content Generation برای تولید محتوای خودکار',
          '۱۴۰۵/۰۱/۰۱',
          [
            { id: 'js26', title: 'بررسی نمونه اولیه', judgeId: 4, status: 'approved' },
            { id: 'js27', title: 'تست خروجی نهایی', judgeId: 5, status: 'waiting_judge' },
          ],
          [
            { id: 'c18', senderId: 6, text: 'نمونه اولیه PCG آماده شد.', time: '۱۰:۰۰', file: { name: 'pcg_demo.mp4', url: '#' } },
            { id: 'c19', senderId: 4, text: 'نمونه خوبه، ادامه بدید.', time: '۱۲:۰۰', file: null },
          ]
        ),
      ],
    },
  ],
};

export const notifications = [
  {
    id: 'n1', type: 'chat',
    text: 'محمد رضایی پیام جدیدی در «پیاده‌سازی و چینش صحنه» ارسال کرد',
    time: '۵ دقیقه پیش', read: false, missionId: 'm-sahne',
  },
  {
    id: 'n2', type: 'approval',
    text: 'گام «بررسی طرح صحنه» در مأموریت «پیاده‌سازی و چینش صحنه» تأیید شد',
    time: '۲ ساعت پیش', read: false, missionId: 'm-sahne',
  },
  {
    id: 'n3', type: 'assignment',
    text: 'مأموریت «بحث ارتباط صوتی» به امیر موسوی اختصاص یافت',
    time: '۳ ساعت پیش', read: false, missionId: 'm-voice',
  },
  {
    id: 'n4', type: 'fix',
    text: 'مأموریت «طراحی پوستر نمایشگاه» نیازمند اصلاح است',
    time: 'دیروز', read: true, missionId: 'm-exhibition-poster',
  },
  {
    id: 'n5', type: 'approval',
    text: 'مأموریت «عایق‌بندی صوتی استودیو» تأیید شد',
    time: 'دیروز', read: true, missionId: 'm-studio-acoustic',
  },
  {
    id: 'n6', type: 'chat',
    text: 'امیر موسوی پیام جدیدی در «تحقیق و توسعه ابزارک‌های PCG» ارسال کرد',
    time: '۲ روز پیش', read: true, missionId: 'm-pcg',
  },
];
