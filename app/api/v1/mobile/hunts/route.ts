import { NextResponse } from 'next/server';
import { getMobileUserFromRequest } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { getHuntsByStatusWithParticipation } from '@/lib/api/queries/hunts/getHuntsByStatusWithParticipation';
import { huntListItemSchema } from '@/lib/schemas/mobileApi';
import { z } from 'zod';

const huntListResponseSchema = z.array(huntListItemSchema);

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return String(value);
}

export async function GET(request: Request): Promise<NextResponse> {
  const result = await getMobileUserFromRequest(request);
  if (!result) {
    return mobileApi.unauthorized();
  }
  if ('error' in result) {
    return mobileApi.conflict(result.error);
  }
  const hunts = await getHuntsByStatusWithParticipation({
    userId: result.user.id,
    statuses: ['published', 'completed'],
  });

  const payload = hunts.map((h) => ({
    id: h.id,
    title: h.title,
    slug: h.slug,
    description: h.description,
    startAt: toIsoString(h.startAt),
    endAt: toIsoString(h.endAt),
    createdBy: h.createdBy,
    createdAt: toIsoString(h.createdAt),
    updatedAt: toIsoString(h.updatedAt),
    status: h.status,
    userIsParticipant: h.userIsParticipant,
    imageUrl: h.imageUrl ?? null,
  }));
  const validated = huntListResponseSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[GET /mobile/hunts] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}
