/**
 * تنظیم مجید آقا حقی و علی آقا جان به نقش OBSERVER (مانیتور)
 *
 * اجرا: npm run prisma:set-observers
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const OBSERVERS: { phones: string[]; name: string }[] = [
  { phones: ['09128045528', '09128045529'], name: 'مجید آقا حقی' },
  { phones: ['09121234567'], name: 'علی آقا جان' },
];

async function main() {
  for (const { phones, name } of OBSERVERS) {
    let updated = false;
    for (const phone of phones) {
      const user = await prisma.user.findUnique({ where: { phone } });
      if (user) {
        await prisma.user.update({ where: { phone }, data: { role: UserRole.OBSERVER } });
        console.log(`✓ ${name} (${phone}) → OBSERVER`);
        updated = true;
        break;
      }
    }
    if (!updated) {
      console.log(`⚠ ${name} (${phones.join(' یا ')}) در دیتابیس نیست.`);
    }
  }
  console.log('\n✓ هر دو کاربر به نقش مانیتور (OBSERVER) تنظیم شدند.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
