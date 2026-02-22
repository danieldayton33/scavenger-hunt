import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scavengerHunts, huntParticipants } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getMobileUserFromRequest } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { pathParams } from '@/lib/validators/mobile';
import { joinHuntResponseSchema } from '@/lib/schemas/mobileApi';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ huntId: string }> }
): Promise<NextResponse> {
  const result = await getMobileUserFromRequest(request);
  if (!result || 'error' in result) {
    return mobileApi.unauthorized();
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

  if (!hunt) {
    return mobileApi.notFound('Hunt not found');
  }

  const existing = await db.query.huntParticipants.findFirst({
    where: and(
      eq(huntParticipants.huntId, huntId),
      eq(huntParticipants.userId, result.user.id)
    ),
  });

  if (existing) {
    const payload = { id: existing.id, alreadyJoined: true };
    const validated = joinHuntResponseSchema.safeParse(payload);
    if (!validated.success) {
      console.error('[POST /mobile/hunts/:huntId/join] Response shape invalid:', validated.error.flatten());
      return mobileApi.serverError();
    }
    return jsonSuccess(validated.data);
  }

  const [inserted] = await db
    .insert(huntParticipants)
    .values({ huntId, userId: result.user.id })
    .returning({ id: huntParticipants.id });

  const payload = { id: inserted!.id, alreadyJoined: false };
  const validated = joinHuntResponseSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[POST /mobile/hunts/:huntId/join] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}
