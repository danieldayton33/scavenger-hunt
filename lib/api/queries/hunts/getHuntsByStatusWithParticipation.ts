import { db } from '@/db';
import { scavengerHunts, huntParticipants } from '@/db/schema';
import { HuntStatus, ScavengerHunt } from '@/lib/schemas/hunt';
import { desc, eq, getTableColumns, and, exists, sql, inArray } from 'drizzle-orm';

export type HuntWithParticipation = ScavengerHunt & {
  userIsParticipant: boolean;
};

export async function getHuntsByStatusWithParticipation({
  userId,
  statuses = ['published'],
}: {
  userId?: string;
  statuses?: HuntStatus[];
}): Promise<HuntWithParticipation[]> {
  console.log('userId', userId);
  const rows = await db
    .select({
      ...getTableColumns(scavengerHunts),
      userIsParticipant: userId
        ? exists(
            db
              .select({ id: huntParticipants.id })
              .from(huntParticipants)
              .where(
                and(
                  eq(huntParticipants.huntId, scavengerHunts.id),
                  eq(huntParticipants.userId, userId)
                )
              )
          )
        : sql<boolean>`false`,
    })
    .from(scavengerHunts)
    .where(inArray(scavengerHunts.status, statuses))
    .orderBy(desc(scavengerHunts.createdAt));

  return rows as HuntWithParticipation[];
}
