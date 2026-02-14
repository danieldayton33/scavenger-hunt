'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { huntParticipants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getParticipantsByHuntIdWithUserInfo(huntId: number) {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  const participants = await db.query.huntParticipants.findMany({
    where: eq(huntParticipants.huntId, huntId),
    with: {
      user: true,
    },
  });
  return participants;
}
