/**
 * اسکریپت اضافه کردن امیر آقا و دکتر میثم
 *
 * اجرا: npm run prisma:add-amir-meysam
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
  // ۱. امیر آقا - یوزر
  const amir = await createOrUpdateUser(
    '09125678901',
    'امیر آقا',
    'AmirAgha901',
    UserRole.USER,
  );
  console.log(`✓ امیر آقا (id: ${amir.id}) | شماره: ${amir.phone} | رمز: AmirAgha901 | نقش: USER`);

  // ۲. دکتر میثم - یوزر (شماره ۰۹۱۲)
  const meysamPhone = '09125678902';
  const meysamPw = 'DrMeysam8902';
  const oldMeysam = await prisma.user.findUnique({ where: { phone: '09138901234' } });
  if (oldMeysam) {
    await prisma.user.update({
      where: { phone: '09138901234' },
      data: { phone: meysamPhone, name: 'دکتر میثم', password: await bcrypt.hash(meysamPw, 10), role: UserRole.USER },
    });
    console.log(`✓ دکتر میثم (id: ${oldMeysam.id}) | شماره: ${meysamPhone} | رمز: ${meysamPw} | نقش: USER (آپدیت از ۰۹۱۳)`);
  } else {
    const meysam = await createOrUpdateUser(meysamPhone, 'دکتر میثم', meysamPw, UserRole.USER);
    console.log(`✓ دکتر میثم (id: ${meysam.id}) | شماره: ${meysam.phone} | رمز: ${meysamPw} | نقش: USER`);
  }

  // ریست sequence
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
