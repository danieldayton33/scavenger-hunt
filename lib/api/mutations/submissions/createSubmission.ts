'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { submissions } from '@/db/schema';
import { revalidateTag } from 'next/cache';
import { SubmissionFormData, SubmissionSchema } from '@/lib/schemas/submission';

export async function createSubmission(submissionData: SubmissionFormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const userId = session.user.id;

  const data = SubmissionSchema.parse(submissionData);

  try {
    // Check if submission already exists for this user, hunt, and item
    const existing = await db.query.submissions.findFirst({
      where: (submissions, { and, eq }) =>
        and(
          eq(submissions.huntId, data.huntId),
          eq(submissions.itemId, data.itemId),
          eq(submissions.userId, userId)
        ),
    });

    if (existing) {
      throw new Error('Submission already exists for this item');
    }

    const result = await db
      .insert(submissions)
      .values({
        huntId: data.huntId,
        itemId: data.itemId,
        userId,
        imageUrl: data.imageUrl ?? null,
        comment: data.comment ?? null,
        lat: data.lat !== undefined ? data.lat.toString() : null,
        lng: data.lng !== undefined ? data.lng.toString() : null,
        accuracyMeters: data.accuracyMeters !== undefined ? data.accuracyMeters.toString() : null,
        status: 'pending',
      })
      .returning();

    // Revalidate relevant cache tags
    revalidateTag(`hunt-${data.huntId}`, 'max');
    revalidateTag('submissions', 'max');
    revalidateTag(`scoreboard-${data.huntId}`, 'max');

    return {
      id: result[0].id,
    };
  } catch (error) {
    console.error('Error creating submission:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create submission');
  }
}
