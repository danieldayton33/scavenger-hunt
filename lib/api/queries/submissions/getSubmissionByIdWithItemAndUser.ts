'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { submissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type SubmissionWithItemAndUser = Awaited<
  ReturnType<typeof getSubmissionByIdWithItemAndUser>
>;

/**
 * Returns a single submission with full item (incl. lat/lng) and user info.
 * Admin only. Returns null if not found or not admin.
 */
export default async function getSubmissionByIdWithItemAndUser(submissionId: number) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
      item: true,
    },
  });

  return submission ?? null;
}
