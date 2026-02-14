import { db } from '@/db';
import { and, eq } from 'drizzle-orm';
import { submissions } from '@/db/schema';

export default async function getSubmissionsForUserByHuntId(huntId: number, userId: string) {
  try {
    const rows = await db.query.submissions.findMany({
      where: and(eq(submissions.huntId, huntId), eq(submissions.userId, userId)),
    });
    return rows;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return { error: 'Internal server error' };
  }
}
