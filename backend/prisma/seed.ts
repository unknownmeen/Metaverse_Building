import {
  PrismaClient,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * الگوریتم رمز: نام لاتین (پیشوند) + چهار رقم آخر شماره تماس
 * مثال: علی عسگری، 09128119142 → Ali9142
 */
function getPassword(prefix: string, phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return prefix + last4;
}

const USERS: { name: string; phone: string; role: UserRole; nameEn: string }[] = [
  { name: 'علی عسگری', phone: '09128119142', role: UserRole.ADMIN, nameEn: 'Ali' },
  { name: 'مصطفی محسنی کبیر', phone: '09129324227', role: UserRole.ADMIN, nameEn: 'Mostafa' },
  { name: 'پارسا یاهوئی', phone: '09199930739', role: UserRole.USER, nameEn: 'Parsa' },
  { name: 'علیرضا محسنی کبیر', phone: '09008500780', role: UserRole.USER, nameEn: 'Alireza' },
  { name: 'ایمان رضایی', phone: '09933035601', role: UserRole.USER, nameEn: 'Iman' },
  { name: 'محمدرضا دالایی', phone: '09374341108', role: UserRole.JUDGE, nameEn: 'Mohammadreza' },
  { name: 'محمدرضا غفاری', phone: '09391722439', role: UserRole.JUDGE, nameEn: 'MohammadrezaG' },
  { name: 'محمدرضا سلامی', phone: '09912385786', role: UserRole.JUDGE, nameEn: 'MohammadrezaS' },
  { name: 'احسان رضوی', phone: '09396410401', role: UserRole.USER, nameEn: 'Ehsan' },
  { name: 'عیسی اویسی', phone: '09059258899', role: UserRole.USER, nameEn: 'Eisa' },
  { name: 'علی ضیاءفر', phone: '09059737386', role: UserRole.USER, nameEn: 'AliZ' },
  { name: 'مانی کرمی', phone: '09203547430', role: UserRole.USER, nameEn: 'Mani' },
  { name: 'امیرحسین داودی', phone: '09029869550', role: UserRole.USER, nameEn: 'Amirhossein' },
  { name: 'سجاد هاشمی', phone: '09190157264', role: UserRole.USER, nameEn: 'Sajad' },
  { name: 'سبحان درخشان فرد', phone: '09046189403', role: UserRole.USER, nameEn: 'Sobhan' },
  { name: 'نیما ارغشی', phone: '09100188535', role: UserRole.USER, nameEn: 'Nima' },
  { name: 'پارسا امیری', phone: '09912775541', role: UserRole.ADMIN, nameEn: 'ParsaA' },
  { name: 'متین عبدالهی', phone: '09024138218', role: UserRole.USER, nameEn: 'Matin' },
  { name: 'حمیدرضا حمیدزاده', phone: '09024476757', role: UserRole.USER, nameEn: 'Hamidreza' },
  { name: 'حسین مارتین', phone: '09044549749', role: UserRole.USER, nameEn: 'Hossein' },
  { name: 'سهیل اسلامی', phone: '09023921081', role: UserRole.USER, nameEn: 'Soheil' },
  { name: 'کیارش اشراقی', phone: '09134844574', role: UserRole.USER, nameEn: 'Kiarash' },
  { name: 'سجاد پاک‌نژاد', phone: '09191110790', role: UserRole.USER, nameEn: 'SajadP' },
  { name: 'علی شریف', phone: '09301333219', role: UserRole.USER, nameEn: 'AliS' },
];

async function main() {
  await prisma.notification.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.judgingStep.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i];
    const plainPassword = getPassword(u.nameEn, u.phone);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await prisma.user.create({
      data: {
        id: i + 1,
        name: u.name,
        phone: u.phone,
        password: hashedPassword,
        avatarId: `av${(i % 8) + 1}`,
        role: u.role,
      },
    });
  }

  await prisma.product.create({
    data: {
      id: 'root',
      title: 'پروژه امام (ع)',
      description: '',
      parentId: null,
    },
  });

  const mainProducts = [
    { id: 'p-atelier', title: 'آتلیه حاج حمید', description: 'مجموعه فعالیت‌های هنری، فرهنگی و تولید محتوای آتلیه حاج حمید' },
    { id: 'p-talar', title: 'تالار سوره صف', description: 'تالار سوره صف' },
    { id: 'p-safine', title: 'سفینه فرماندهی', description: 'سفینه فرماندهی' },
    { id: 'p-metaverse', title: 'محصول زیرساخت متاورس', description: 'زیرساخت متاورس' },
    { id: 'p-janebi', title: 'محصول جانبی زیرساخت', description: 'محصولات جانبی زیرساخت' },
  ];

  for (const p of mainProducts) {
    await prisma.product.create({
      data: { ...p, parentId: 'root' },
    });
  }

  const atelierSubProducts = [
    { id: 'p-sen-mahzar', title: 'سن در محضر', description: 'سن در محضر' },
    { id: 'p-sen-falestin', title: 'سن فلسطین', description: 'سن فلسطین' },
    { id: 'p-sen-noor', title: 'سن نور و ظلمت', description: 'سن نور و ظلمت' },
  ];

  for (const p of atelierSubProducts) {
    await prisma.product.create({
      data: { ...p, parentId: 'p-atelier' },
    });
  }

  const credentialsPath = path.join(process.cwd(), 'prisma', 'users-credentials.txt');
  const lines = [
    'لیست کاربران و رمز عبور',
    'الگوریتم رمز: نام لاتین (پیشوند هر نفر) + چهار رقم آخر شماره تماس (مثال: علی عسگری، 09128119142 → Ali9142)',
    '---',
    '',
    ...USERS.map((u, i) => `${i + 1}. ${u.name} | نام کاربری (شماره تماس): ${u.phone} | رمز: ${getPassword(u.nameEn, u.phone)} | نقش: ${u.role}`),
  ];
  fs.writeFileSync(credentialsPath, lines.join('\n'), 'utf-8');
  console.log('فایل لیست کاربران و رمزها در prisma/users-credentials.txt ذخیره شد.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
