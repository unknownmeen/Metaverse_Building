/**
 * نمونه اسکریپت اضافه کردن کاربر مانیتور (OBSERVER)
 * کاربر مانیتور: فقط مشاهده، بدون امکان assign شدن یا گرفتن تسک
 *
 * اجرا: npx ts-node prisma/add-observer.ts
 * یا: npm run prisma:add-observer (اگر اسکریپت اضافه شده باشد)
 */

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const phone = '09120000001';
  const name = 'کاربر مانیتور نمونه';
  const password = 'Observer1234';
  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    await prisma.user.update({
      where: { phone },
      data: { name, password: hashed, role: UserRole.OBSERVER },
    });
    console.log(`✓ ${name} به‌روزرسانی شد | شماره: ${phone} | رمز: ${password} | نقش: OBSERVER`);
  } else {
    const { _max } = await prisma.user.aggregate({ _max: { id: true } });
    const nextId = (_max?.id ?? 0) + 1;
    await prisma.user.create({
      data: { id: nextId, name, phone, password: hashed, role: UserRole.OBSERVER },
    });
    console.log(`✓ ${name} ایجاد شد | شماره: ${phone} | رمز: ${password} | نقش: OBSERVER`);
  }

  console.log('\nکاربر مانیتور می‌تواند وارد شود و سامانه را مشاهده کند، اما:');
  console.log('- در لیست assignee/judge ظاهر نمی‌شود');
  console.log('- دکمه «گرفتن تسک» را نمی‌بیند');
  console.log('- امکان ارسال پیام در چت: فعلاً آزاد (طبق درخواست)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
