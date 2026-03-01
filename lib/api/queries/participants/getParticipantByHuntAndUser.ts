'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { huntParticipants } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export async function getParticipantByHuntAndUser(huntId: number, userId: string) {
  try {
    const participant = await db.query.huntParticipants.findFirst({
      where: and(eq(huntParticipants.huntId, huntId), eq(huntParticipants.userId, userId)),
    });
    return participant;
  } catch (error) {
    console.error('Error fetching participant:', error);
    return null;
  }
}

export async function isUserParticipant(huntId: number) {
  const session = await auth();
  if (!session?.user) {
    return false;
  }
  const userId = session.user.id;
  const uncachedParticipant = await getParticipantByHuntAndUser(huntId, userId);
  console.log('uncachedParticipant', uncachedParticipant);

  // Cache the participant check with tags for revalidation
  const getCachedParticipant = unstable_cache(
    () => getParticipantByHuntAndUser(huntId, userId),
    [`participant-${huntId}-${userId}`],
    {
      tags: ['participants', `hunt-${huntId}`, `participant-${huntId}-${userId}`],
      revalidate: 60, // Cache for 60 seconds
    }
  );

  const participant = await getCachedParticipant();
  return !!participant;
}
