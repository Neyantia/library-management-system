import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client.js';
import { hash } from '@node-rs/argon2';

function need(name: string): string {
  const v = process.env[name];

  if (!v) throw new Error(`Missing ${name} in .env`);
  return v;
}

async function main() {
  const DATABASE_URL = need('DATABASE_URL');
  const ADMIN_EMAIL = need('ADMIN_EMAIL');
  const ADMIN_PASSWORD = need('ADMIN_PASSWORD');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: DATABASE_URL }),
  });

  const passwordHash = await hash(ADMIN_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'Adminski',
      passwordHash,
    },
  });

  console.log('Admin seeded:', admin.email, admin.id);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
