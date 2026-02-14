'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { submissions } from '@/db/schema';
import { revalidateTag } from 'next/cache';
import { SubmissionFormData, SubmissionFormInputSchema } from '@/lib/schemas/submission';
import { eq, and } from 'drizzle-orm';

export async function updateSubmission(
  submissionId: number,
  submissionData: SubmissionFormData
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const data = SubmissionFormInputSchema.parse({
    imageUrl: submissionData.imageUrl,
    comment: submissionData.comment,
    lat: submissionData.lat,
    lng: submissionData.lng,
    accuracyMeters: submissionData.accuracyMeters,
  });

  try {
    // Check if submission exists and belongs to the user
    const existing = await db.query.submissions.findFirst({
      where: (submissions, { and, eq }) =>
        and(eq(submissions.id, submissionId), eq(submissions.userId, session.user.id)),
    });

    if (!existing) {
      throw new Error('Submission not found or unauthorized');
    }

    // Verify the submission belongs to the correct hunt and item
    if (existing.huntId !== submissionData.huntId || existing.itemId !== submissionData.itemId) {
      throw new Error('Invalid hunt or item for this submission');
    }

    const result = await db
      .update(submissions)
      .set({
        imageUrl: data.imageUrl ?? null,
        comment: data.comment ?? null,
        lat: data.lat !== undefined ? data.lat.toString() : null,
        lng: data.lng !== undefined ? data.lng.toString() : null,
        accuracyMeters: data.accuracyMeters !== undefined ? data.accuracyMeters.toString() : null,
      })
      .where(and(eq(submissions.id, submissionId), eq(submissions.userId, session.user.id)))
      .returning();

    // Revalidate relevant cache tags
    revalidateTag(`hunt-${submissionData.huntId}`, 'max');
    revalidateTag('submissions', 'max');
    revalidateTag(`scoreboard-${submissionData.huntId}`, 'max');

    return {
      id: result[0].id,
    };
  } catch (error) {
    console.error('Error updating submission:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update submission');
  }
}

