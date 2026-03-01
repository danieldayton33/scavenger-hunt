'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { huntParticipants } from '@/db/schema';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function joinHunt(huntId: number, huntSlug?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const userId = session.user.id;

  try {
    // Check if user is already a participant
    const existing = await db.query.huntParticipants.findFirst({
      where: (participants, { and, eq }) =>
        and(eq(participants.huntId, huntId), eq(participants.userId, userId)),
    });

    if (existing) {
      return { id: existing.id, alreadyJoined: true };
    }

    // Add user as participant
    const result = await db
      .insert(huntParticipants)
      .values({
        huntId,
        userId,
      })
      .returning();

    // Revalidate relevant cache tags
    revalidateTag(`hunt-${huntId}`, 'max');
    revalidateTag('participants', 'max');
    revalidateTag(`participant-${huntId}-${userId}`, 'max');

    // Revalidate the page paths to ensure fresh data
    if (huntSlug) {
      revalidatePath(`/scavenger-hunt/${huntSlug}`);
    }
    revalidatePath('/scavenger-hunt', 'layout');
    revalidatePath('/archive');

    return {
      id: result[0].id,
      alreadyJoined: false,
    };
  } catch (error) {
    console.error('Error joining hunt:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to join hunt');
  }
}
