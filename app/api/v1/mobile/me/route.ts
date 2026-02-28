import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getMobileUserFromRequest } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { mobileUserSchema } from '@/lib/schemas/mobileApi';
import { eq } from 'drizzle-orm';

export async function GET(request: Request): Promise<NextResponse> {
  const result = await getMobileUserFromRequest(request);
  if (!result) {
    return mobileApi.unauthorized();
  }
  if ('error' in result) {
    return mobileApi.authConflict(result.error);
  }
  const { user } = result;
  const payload = {
    id: user.id,
    role: user.role,
    firebaseUid: user.firebaseUid,
    email: user.email,
    name: user.name,
    image: user.image,
  };
  const validated = mobileUserSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[GET /mobile/me] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const result = await getMobileUserFromRequest(request);
  if (!result) {
    return mobileApi.unauthorized();
  }
  if ('error' in result) {
    return mobileApi.authConflict(result.error);
  }

  const { user } = result;

  try {
    await db.delete(users).where(eq(users.id, user.id));
    return jsonSuccess({ deleted: true as const }, 200);
  } catch (e) {
    console.error('[DELETE /mobile/me] Failed to delete user', e);
    return mobileApi.serverError();
  }
}
