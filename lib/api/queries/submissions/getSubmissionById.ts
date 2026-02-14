import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { submissions } from '@/db/schema';

export default async function getSubmissionById(submissionId: number) {
  try {
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
    });
    return submission || { error: 'Submission not found' };
  } catch (error) {
    console.error('Error fetching submission:', error);
    return { error: 'Internal server error' };
  }
}

