'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { submissions } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { cacheTag } from 'next/cache';

export type SubmissionWithUserAndItem = Awaited<
  ReturnType<typeof getSubmissionsByHuntId>
>[number];

export default async function getSubmissionsByHuntId(
  huntId: number,
  status?: 'pending' | 'approved' | 'rejected'
) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return [];
  }

  const whereClause =
    status != null
      ? and(eq(submissions.huntId, huntId), eq(submissions.status, status))
      : eq(submissions.huntId, huntId);

  const list = await db.query.submissions.findMany({
    where: whereClause,
    orderBy: (s, { desc }) => [desc(s.submittedAt)],
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
      item: {
        columns: { id: true, title: true },
      },
    },
  });

  return list;
}
