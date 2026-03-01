'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { users, huntParticipants, submissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type UserWithHuntsAndSubmissions = NonNullable<
  Awaited<ReturnType<typeof getUserByIdWithHuntsAndSubmissions>>
>;

export default async function getUserByIdWithHuntsAndSubmissions(userId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    with: {
      submissions: {
        orderBy: (s, { desc }) => [desc(s.submittedAt)],
        with: {
          hunt: { columns: { id: true, title: true, slug: true } },
          item: { columns: { id: true, title: true } },
        },
      },
    },
  });

  if (!user) return null;

  const participatedHunts = await db.query.huntParticipants.findMany({
    where: eq(huntParticipants.userId, userId),
    with: {
      hunt: { columns: { id: true, title: true, slug: true } },
    },
  });

  return {
    ...user,
    participatedHunts: participatedHunts.map((p) => ({ hunt: p.hunt, joinedAt: p.joinedAt })),
  };
}
