import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scavengerHunts, huntItems, submissions } from '@/db/schema';
import { and, eq, asc } from 'drizzle-orm';
import { requireMobileAuth } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { pathParams } from '@/lib/validators/mobile';
import { huntItemWithSubmissionSchema } from '@/lib/schemas/mobileApi';
import { z } from 'zod';

const huntItemsResponseSchema = z.array(huntItemWithSubmissionSchema);

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return String(value);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ huntId: string }> }
): Promise<NextResponse> {
  const auth = await requireMobileAuth(request);
  if (auth instanceof NextResponse) return auth;

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

  const items = await db.query.huntItems.findMany({
    where: eq(huntItems.huntId, huntId),
    orderBy: asc(huntItems.sortOrder),
  });

  const userSubmissions = await db
    .select({
      itemId: submissions.itemId,
      status: submissions.status,
      id: submissions.id,
    })
    .from(submissions)
    .where(
      and(
        eq(submissions.huntId, huntId),
        eq(submissions.userId, auth.user.id)
      )
    );

  const submissionByItem = new Map(
    userSubmissions.map((s) => [s.itemId, { id: s.id, status: s.status }])
  );

  const payload = items.map((item) => ({
    id: item.id,
    huntId: item.huntId,
    title: item.title,
    description: item.description,
    hint: item.hint,
    imageUrl: item.imageUrl,
    itemType: item.itemType,
    lat: item.lat,
    lng: item.lng,
    sortOrder: item.sortOrder,
    createdAt: toIsoString(item.createdAt),
    submission: submissionByItem.get(item.id) ?? null,
  }));
  const validated = huntItemsResponseSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[GET /mobile/hunts/:huntId/items] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}
