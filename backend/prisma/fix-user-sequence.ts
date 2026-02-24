/**
 * ریست کردن sequence جدول User
 * وقتی با id دستی (seed، add-two-users و...) رکورد اضافه می‌کنیم،
 * sequence پستگرس به‌روز نمی‌شود و در Prisma Studio خطای P2002 می‌دهد.
 *
 * اجرا: npm run prisma:fix-user-sequence
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"User"', 'id'),
      COALESCE((SELECT MAX(id) FROM "User"), 1)
    );
  `);
  console.log('✓ Sequence جدول User با موفقیت ریست شد.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
