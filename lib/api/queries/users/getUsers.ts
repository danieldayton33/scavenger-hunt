'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';

export default async function getUsers() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return [];
  }
  return db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: [desc(users.createdAt)],
  });
}
