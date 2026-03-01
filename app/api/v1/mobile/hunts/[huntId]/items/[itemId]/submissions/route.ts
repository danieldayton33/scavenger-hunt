import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scavengerHunts, huntItems, submissions } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireMobileAuth } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { pathParams, createSubmissionBodySchema } from '@/lib/validators/mobile';
import { createSubmissionResponseSchema } from '@/lib/schemas/mobileApi';

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return String(value);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ huntId: string; itemId: string }> }
): Promise<NextResponse> {
  const auth = await requireMobileAuth(request);
  if (auth instanceof NextResponse) return auth;

  const parsedParams = pathParams.huntIdItemId.safeParse(await params);
  if (!parsedParams.success) {
    return mobileApi.badRequest('Invalid huntId or itemId');
  }
  const { huntId, itemId } = parsedParams.data;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mobileApi.badRequest('Invalid JSON body');
  }
  const parsedBody = createSubmissionBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return mobileApi.badRequest(
      parsedBody.error.issues.map((e) => e.message).join('; ') || 'Validation error'
    );
  }
  const data = parsedBody.data;

  const hunt = await db.query.scavengerHunts.findFirst({
    where: and(
      eq(scavengerHunts.id, huntId),
      eq(scavengerHunts.status, 'published')
    ),
    columns: { id: true },
  });
  if (!hunt) return mobileApi.notFound('Hunt not found');

  const item = await db.query.huntItems.findFirst({
    where: and(
      eq(huntItems.huntId, huntId),
      eq(huntItems.id, itemId)
    ),
    columns: { id: true },
  });
  if (!item) return mobileApi.notFound('Item not found');

  const existing = await db.query.submissions.findFirst({
    where: and(
      eq(submissions.huntId, huntId),
      eq(submissions.itemId, itemId),
      eq(submissions.userId, auth.user.id)
    ),
  });

  if (existing) {
    return mobileApi.conflict('Already submitted for this item', {
      existing: {
        id: existing.id,
        status: existing.status,
        submittedAt: existing.submittedAt,
      },
    });
  }

  const imageUrl = data.imageUrl ?? (data.imagePath ? data.imagePath : null);

  const [inserted] = await db
    .insert(submissions)
    .values({
      huntId,
      itemId,
      userId: auth.user.id,
      imageUrl,
      comment: data.comment ?? null,
      lat: data.lat != null ? String(data.lat) : null,
      lng: data.lng != null ? String(data.lng) : null,
      accuracyMeters: data.accuracyMeters != null ? String(data.accuracyMeters) : null,
      status: 'pending',
    })
    .returning();

  const payload = {
    id: inserted!.id,
    status: inserted!.status,
    submittedAt: toIsoString(inserted!.submittedAt),
  };
  const validated = createSubmissionResponseSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[POST /mobile/hunts/:huntId/items/:itemId/submissions] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data, 201);
}
