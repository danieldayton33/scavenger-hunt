import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { requireMobileAuth } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { pathParams } from '@/lib/validators/mobile';
import { scoreboardEntrySchema } from '@/lib/schemas/mobileApi';
import { z } from 'zod';
import { getHuntScoreboardNoDuplicateItems } from '@/lib/api/queries/scoreboard/getHuntScoreboardNoDuplicateItems';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';

function toIsoString(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
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
    where: eq(scavengerHunts.id, huntId),
    columns: { id: true, status: true },
  });
  if (!hunt) return mobileApi.notFound('Hunt not found');
  if (!['published', 'completed'].includes(hunt.status)) {
    return mobileApi.notFound('Hunt not found');
  }

  const rows = await getHuntScoreboardNoDuplicateItems(huntId);
  const payload = rows.map((r) => ({
    userId: r.userId,
    userName: r.userName ?? null,
    userImage: r.userImage ?? null,
    score: Number(r.score ?? 0),
    firstApprovedAt: toIsoString(r.firstApprovedAt),
    lastApprovedAt: toIsoString(r.lastApprovedAt),
    completionTime: r.completionTime ?? null,
  }));

  const validated = z.array(scoreboardEntrySchema).safeParse(payload);
  if (!validated.success) {
    console.error(
      '[GET /mobile/hunts/:huntId/scoreboard] Response shape invalid:',
      validated.error.flatten()
    );
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}
