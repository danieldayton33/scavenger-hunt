import { NextResponse } from 'next/server';
import { getMobileUserFromRequest } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { registerDeviceBodySchema } from '@/lib/validators/mobile';
import { db } from '@/db';
import { userDevices } from '@/db/schema';

export async function POST(request: Request): Promise<NextResponse> {
  const result = await getMobileUserFromRequest(request);
  if (!result || !('user' in result)) {
    return mobileApi.unauthorized();
  }
  if ('error' in result) {
    return mobileApi.unauthorized();
  }

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
  const userId = result.user.id;

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
