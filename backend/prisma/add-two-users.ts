/**
 * اسکریپت اضافه کردن حسین باقری و حسین طاهری
 *
 * اجرا: npx ts-node prisma/add-two-users.ts
 * یا از پوشه backend: npx ts-node prisma/add-two-users.ts
 */

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** تبدیل اعداد فارسی/عربی به انگلیسی */
function toEnglishDigits(s: string): string {
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  const ar = '٠١٢٣٤٥٦٧٨٩';
  return s.replace(/[۰-۹٠-٩]/g, (c) => {
    const i = fa.indexOf(c) >= 0 ? fa.indexOf(c) : ar.indexOf(c);
    return i >= 0 ? String(i) : c;
  });
}

function normalizePhone(phone: string): string {
  return toEnglishDigits(phone).replace(/\D/g, '');
}

async function createOrUpdateUser(
  phone: string,
  name: string,
  password: string,
  role: UserRole,
) {
  const normalizedPhone = normalizePhone(phone);
  const hashed = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
  if (existing) {
    return prisma.user.update({
      where: { phone: normalizedPhone },
      data: { name, password: hashed, role },
    });
  }
  const { _max } = await prisma.user.aggregate({ _max: { id: true } });
  const nextId = (_max?.id ?? 0) + 1;
  return prisma.user.create({
    data: { id: nextId, name, phone: normalizedPhone, password: hashed, role },
  });
}

async function main() {
  // ۱. حسین باقری - یوزر
  const hosseinB = await createOrUpdateUser(
    '09025394237',
    'حسین باقری',
    'HosseinB4237',
    UserRole.USER,
  );
  console.log(`✓ حسین باقری (id: ${hosseinB.id}) | شماره: ${hosseinB.phone} | رمز: HosseinB4237 | نقش: USER`);

  // ۲. حسین طاهری - داور
  const hosseinT = await createOrUpdateUser(
    '09359005114',
    'حسین طاهری',
    'HosseinT5114',
    UserRole.JUDGE,
  );
  console.log(`✓ حسین طاهری (id: ${hosseinT.id}) | شماره: ${hosseinT.phone} | رمز: HosseinT5114 | نقش: JUDGE`);

  // ریست sequence تا در Prisma Studio بتوان رکورد جدید ساخت
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"User"', 'id'),
      COALESCE((SELECT MAX(id) FROM "User"), 1)
    );
  `);
  console.log('✓ Sequence جدول User ریست شد.');

  console.log('\nهمه عملیات با موفقیت انجام شد.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
