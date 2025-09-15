import 'dotenv/config';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const email = 'admin@example.com';
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (!existing.length) {
    await db.insert(users).values({ email, name: 'Admin', role: 'admin' });
  }
}
main().then(() => process.exit(0));
