'use server';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { huntParticipants, submissions, users } from '@/db/schema';
import { cacheLife, cacheTag } from 'next/cache';

export async function getHuntScoreboardNoDuplicateItems(huntId: number) {
  'use cache';
  cacheLife('minutes');
  cacheTag(`scoreboard-${huntId}`);
  cacheTag(`hunt-${huntId}`);
  cacheTag('submissions');

  const score = sql<number>`
    count(distinct ${submissions.itemId})
    filter (where ${submissions.status} = 'approved')
  `.as('score');

  const firstApprovedAt = sql<Date | null>`
    min(${submissions.submittedAt}) filter (where ${submissions.status} = 'approved')
  `.as('firstApprovedAt');

  const lastApprovedAt = sql<Date | null>`
    max(${submissions.submittedAt}) filter (where ${submissions.status} = 'approved')
  `.as('lastApprovedAt');

  const completionTime = sql<string | null>`
    (
      max(${submissions.submittedAt}) filter (where ${submissions.status} = 'approved')
      -
      min(${submissions.submittedAt}) filter (where ${submissions.status} = 'approved')
    )
  `.as('completionTime');

  return db
    .select({
      userId: huntParticipants.userId,
      joinedAt: huntParticipants.joinedAt,
      userName: users.name,
      userImage: users.image,
      score,
      firstApprovedAt,
      lastApprovedAt,
      completionTime,
    })
    .from(huntParticipants)
    .innerJoin(users, eq(users.id, huntParticipants.userId))
    .leftJoin(
      submissions,
      and(eq(submissions.huntId, huntId), eq(submissions.userId, huntParticipants.userId))
    )
    .where(eq(huntParticipants.huntId, huntId))
    .groupBy(huntParticipants.userId, huntParticipants.joinedAt, users.name, users.image)
    .orderBy(
      desc(score),
      // among same score, whoever reached that score earlier
      sql`${lastApprovedAt} nulls last`,
      // extra tie-breaker
      sql`${completionTime} nulls last`
    );
}
