import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    /*
    * REQUIRED: Manual Seeding or Env Vars
    * The user has requested to remove hardcoded credentials.
    * To seed the database, either:
    * 1. Use a separate secure script that reads from environment variables.
    * 2. Manually add users via the application or database console.
    * 
    * Example structure if using env vars:
    * const users = JSON.parse(process.env.SEED_USERS || '[]');
    */
    const users: any[] = []; // Intentionally empty to prevent accidental credential commit

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const upsertedUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role
            },
        });
        console.log(`Upserted user: ${upsertedUser.email}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
