/**
 * اسکریپت اضافه کردن دو یوزر ادمین و ادمین کردن پارسا یاهوئی
 *
 * اجرا: npx ts-node prisma/add-admin-users.ts
 * یا: npm run prisma:add-admins (اگر اسکریپت اضافه شده باشد)
 */

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createOrUpdateUser(
  phone: string,
  name: string,
  password: string,
  role: UserRole,
) {
  const hashed = await bcrypt.hash(password, 10);
  const data = { name, phone, password: hashed, role };
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return prisma.user.update({
      where: { phone },
      data: { name, password: hashed, role },
    });
  }
  return prisma.user.create({ data });
}

async function main() {
  // ۱. اضافه کردن علی آقا جان
  const ali = await createOrUpdateUser(
    '09121234567',
    'علی آقا جان',
    'aliaghajan',
    UserRole.ADMIN,
  );
  console.log(`✓ علی آقا جان (id: ${ali.id}) | شماره: 09121234567 | رمز: aliaghajan`);

  // ۲. اضافه کردن مجید آقا حقی
  // توجه: شماره 09128045529 چون phone یونیک است (هر دو در درخواست 09128045528 بودند)
  const majid = await createOrUpdateUser(
    '09128045529',
    'مجید آقا حقی',
    'majidagha',
    UserRole.ADMIN,
  );
  console.log(`✓ مجید آقا حقی (id: ${majid.id}) | شماره: 09128045529 | رمز: majidagha`);

  // ۳. ادمین کردن پارسا یاهوئی (id: 3)
  const parsa = await prisma.user.update({
    where: { id: 3 },
    data: { role: UserRole.ADMIN },
  });
  console.log(`✓ پارسا یاهوئی ادمین شد (id: ${parsa.id})`);

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
