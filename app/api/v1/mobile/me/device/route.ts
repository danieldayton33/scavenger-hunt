import { NextResponse } from 'next/server';
import { requireMobileAuth } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { registerDeviceBodySchema } from '@/lib/validators/mobile';
import { db } from '@/db';
import { userDevices } from '@/db/schema';

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireMobileAuth(request);
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mobileApi.badRequest('Invalid JSON body');
  }
  const parsed = registerDeviceBodySchema.safeParse(body);
  if (!parsed.success) {
    return mobileApi.badRequest(
      parsed.error.issues.map((e) => e.message).join('; ') || 'Validation error'
    );
  }
  const { platform, pushToken } = parsed.data;
  const userId = user.id;

  try {
    await db
      .insert(userDevices)
      .values({
        userId,
        platform,
        pushToken,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [userDevices.userId, userDevices.platform],
        set: {
          pushToken,
          lastSeenAt: new Date(),
          isActive: true,
        },
      });
  } catch (err) {
    console.error('[POST /mobile/me/device]', err);
    return mobileApi.serverError();
  }

  return jsonSuccess({ registered: true });
}
