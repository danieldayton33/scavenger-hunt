import { NextResponse } from 'next/server';
import { getMobileUserFromRequest } from '@/lib/mobileAuth';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { mobileUserSchema } from '@/lib/schemas/mobileApi';

export async function GET(request: Request): Promise<NextResponse> {
  const result = await getMobileUserFromRequest(request);
  if (!result) {
    return mobileApi.unauthorized();
  }
  if ('error' in result && result.error === 'EMAIL_EXISTS') {
    return mobileApi.conflict('This email is already registered. Please sign in.');
  }
  if (!('user' in result)) {
    return mobileApi.unauthorized();
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
