import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { firebaseLinkCodes } from '@/db/schema';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { verifyFirebaseIdToken } from '@/lib/firebaseAdmin';
import { requestLinkCodeResponseSchema } from '@/lib/schemas/mobileApi';

const CODE_EXPIRES_IN_SECONDS = 600; // 10 minutes
const CODE_LENGTH = 32;

function generateSecureCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  return bytes.toString('hex');
}

export async function POST(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return mobileApi.unauthorized();
  }
  const token = authHeader.slice(7).trim();
  if (!token) return mobileApi.unauthorized();

  let decoded: Awaited<ReturnType<typeof verifyFirebaseIdToken>>;
  try {
    decoded = await verifyFirebaseIdToken(token);
  } catch {
    return mobileApi.unauthorized();
  }

  const firebaseUid = decoded.uid;
  const email = decoded.email;
  if (!email) {
    return mobileApi.forbidden('Firebase token is missing an email');
  }
  if (!decoded.email_verified) {
    return mobileApi.forbidden('Firebase email must be verified to request a link code');
  }

  const code = generateSecureCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRES_IN_SECONDS * 1000);

  try {
    await db.delete(firebaseLinkCodes).where(eq(firebaseLinkCodes.firebaseUid, firebaseUid));
    await db.insert(firebaseLinkCodes).values({
      code,
      firebaseUid,
      email: email.trim().toLowerCase(),
      expiresAt,
    });
  } catch (e) {
    console.error('[POST /mobile/link-firebase/request-code] Insert failed:', e);
    return mobileApi.serverError();
  }

  const payload = { code, expiresIn: CODE_EXPIRES_IN_SECONDS };
  const validated = requestLinkCodeResponseSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[POST /mobile/link-firebase/request-code] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}
