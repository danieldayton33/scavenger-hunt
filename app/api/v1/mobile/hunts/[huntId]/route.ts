import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scavengerHunts, huntParticipants } from '@/db/schema';
import { and, eq, count, inArray } from 'drizzle-orm';
import { getMobileUserFromRequest } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { pathParams } from '@/lib/validators/mobile';
import { huntDetailSchema } from '@/lib/schemas/mobileApi';

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
      inArray(scavengerHunts.status, ['published', 'completed'])
    ),
    columns: {
      id: true,
      title: true,
      slug: true,
      description: true,
      startAt: true,
      endAt: true,
      status: true,
      createdAt: true,
      imageUrl: true,
    },
  });

  if (!hunt) {
    return mobileApi.notFound('Hunt not found');
  }

  const [row] = await db
    .select({ count: count() })
    .from(huntParticipants)
    .where(eq(huntParticipants.huntId, huntId));

  const payload = {
    ...hunt,
    startAt: hunt.startAt instanceof Date ? hunt.startAt.toISOString() : hunt.startAt,
    endAt: hunt.endAt instanceof Date ? hunt.endAt.toISOString() : hunt.endAt,
    createdAt: hunt.createdAt instanceof Date ? hunt.createdAt.toISOString() : hunt.createdAt,
    participantCount: row?.count ?? 0,
  };
  const validated = huntDetailSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[GET /mobile/hunts/:huntId] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}
