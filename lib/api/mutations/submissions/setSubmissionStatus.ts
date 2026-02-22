'use server';

import { auth } from '@/auth/config';
import { db } from '@/db';
import { submissions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { sendPushToUser } from '@/lib/notifications/sendPushToUser';

export type SetSubmissionStatusResult =
  | { ok: true; huntId: number; pushError?: string }
  | { ok: false; error: string };

export async function setSubmissionStatus(
  submissionId: number,
  status: 'approved' | 'rejected'
): Promise<SetSubmissionStatusResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return { ok: false, error: 'Forbidden' };
  }

  try {
    const [updated] = await db
      .update(submissions)
      .set({ status })
      .where(eq(submissions.id, submissionId))
      .returning({
        id: submissions.id,
        huntId: submissions.huntId,
        userId: submissions.userId,
      });

    if (!updated) {
      return { ok: false, error: 'Submission not found' };
    }

    const pushResult = await sendPushToUser(updated.userId, {
      type: 'submission_status',
      huntId: updated.huntId,
      status,
      submissionId: updated.id,
    });

    if (!pushResult.ok) {
      console.error('[setSubmissionStatus] push failed:', pushResult.error);
    }

    revalidateTag('submissions', 'max');
    revalidateTag(`hunt-${updated.huntId}`, 'max');
    revalidateTag(`scoreboard-${updated.huntId}`, 'max');
    revalidatePath('/admin/hunts', 'layout');

    return {
      ok: true,
      huntId: updated.huntId,
      ...(pushResult.ok ? {} : { pushError: pushResult.error }),
    };
  } catch (err) {
    console.error('setSubmissionStatus:', err);
    return { ok: false, error: 'Failed to update submission' };
  }
}
