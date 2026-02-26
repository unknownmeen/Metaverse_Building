/**
 * تنظیم نقش‌ها: فقط ۲ ادمین و ۲ داور
 * - ادمین: مصطفی محسنی کبیر، پارسا امیری
 * - داور: علی عسگری، احسان رضوی
 * - بقیه: USER
 *
 * اجرا: npm run prisma:set-roles
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const ADMINS = [
  { phone: '09129324227', name: 'مصطفی محسنی کبیر' },
  { phone: '09912775541', name: 'پارسا امیری' },
];

const JUDGES = [
  { phone: '09128119142', name: 'علی عسگری' },
  { phone: '09396410401', name: 'احسان رضوی' },
];

async function main() {
  // ۱. همه را USER کن
  await prisma.user.updateMany({
    data: { role: UserRole.USER },
  });
  console.log('✓ همه کاربران به USER تغییر کردند.');

  // ۲. دو ادمین
  for (const { phone, name } of ADMINS) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      await prisma.user.update({ where: { phone }, data: { role: UserRole.ADMIN } });
      console.log(`✓ ${name} (${phone}) → ADMIN`);
    } else {
      console.log(`⚠ ${name} (${phone}) در دیتابیس نیست.`);
    }
  }

  // ۳. دو داور
  for (const { phone, name } of JUDGES) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      await prisma.user.update({ where: { phone }, data: { role: UserRole.JUDGE } });
      console.log(`✓ ${name} (${phone}) → JUDGE`);
    } else {
      console.log(`⚠ ${name} (${phone}) در دیتابیس نیست.`);
    }
  }

  console.log('\n✓ تنظیم نقش‌ها انجام شد: ۲ ادمین، ۲ داور، بقیه USER');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
