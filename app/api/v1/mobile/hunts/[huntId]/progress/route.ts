import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scavengerHunts, huntItems, submissions } from '@/db/schema';
import { and, eq, count } from 'drizzle-orm';
import { getMobileUserFromRequest } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { pathParams } from '@/lib/validators/mobile';
import { progressSchema } from '@/lib/schemas/mobileApi';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ huntId: string }> }
): Promise<NextResponse> {
  const result = await getMobileUserFromRequest(request);
  if (!result) {
    return mobileApi.unauthorized();
  }
  if ('error' in result) {
    return mobileApi.authConflict(result.error);
  }

  const parsed = pathParams.huntId.safeParse(await params);
  if (!parsed.success) {
    return mobileApi.badRequest('Invalid huntId');
  }
  const { huntId } = parsed.data;

  const hunt = await db.query.scavengerHunts.findFirst({
    where: and(
      eq(scavengerHunts.id, huntId),
      eq(scavengerHunts.status, 'published')
    ),
    columns: { id: true },
  });
  if (!hunt) return mobileApi.notFound('Hunt not found');

  const [totalItems] = await db
    .select({ count: count() })
    .from(huntItems)
    .where(eq(huntItems.huntId, huntId));


  const counts = await db
    .select({
      status: submissions.status,
      count: count(),
    })
    .from(submissions)
    .where(
      and(
        eq(submissions.huntId, huntId),
        eq(submissions.userId, result.user.id)
      )
    )
    .groupBy(submissions.status);

  const approved = counts.find((r) => r.status === 'approved')?.count ?? 0;
  const pending = counts.find((r) => r.status === 'pending')?.count ?? 0;
  const rejected = counts.find((r) => r.status === 'rejected')?.count ?? 0;

  const payload = {
    totalItems: totalItems?.count ?? 0,
    approved: Number(approved),
    pending: Number(pending),
    rejected: Number(rejected),
  };
  const validated = progressSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[GET /mobile/hunts/:huntId/progress] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}
