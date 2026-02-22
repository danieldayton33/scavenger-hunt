import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scavengerHunts, submissions } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { getMobileUserFromRequest } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { pathParams } from '@/lib/validators/mobile';
import { submissionSchema } from '@/lib/schemas/mobileApi';
import { z } from 'zod';

const submissionsListResponseSchema = z.array(submissionSchema);

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return String(value);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ huntId: string }> }
): Promise<NextResponse> {
  const result = await getMobileUserFromRequest(request);
  if (!result) {
    return mobileApi.unauthorized();
  }
 if('error' in result) {
    return mobileApi.conflict(result.error);
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

  const list = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.huntId, huntId),
        eq(submissions.userId, result.user.id)
      )
    );

  const payload = list.map((s) => ({
    id: s.id,
    huntId: s.huntId,
    itemId: s.itemId,
    userId: s.userId,
    imageUrl: s.imageUrl,
    comment: s.comment,
    lat: s.lat != null ? String(s.lat) : null,
    lng: s.lng != null ? String(s.lng) : null,
    accuracyMeters: s.accuracyMeters != null ? String(s.accuracyMeters) : null,
    status: s.status,
    submittedAt: toIsoString(s.submittedAt),
  }));
  const validated = submissionsListResponseSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[GET /mobile/hunts/:huntId/submissions] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}
