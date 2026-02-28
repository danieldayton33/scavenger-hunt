import { NextResponse } from 'next/server';
import { and, eq, gt, ne } from 'drizzle-orm';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { firebaseLinkCodes, users } from '@/db/schema';
import { mobileApi, jsonSuccess } from '@/lib/apiResponse';
import { verifyFirebaseIdToken } from '@/lib/firebaseAdmin';
import { linkFirebaseResponseSchema } from '@/lib/schemas/mobileApi';
import { linkFirebaseBodySchema } from '@/lib/validators/mobile';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  const sessionEmail = session?.user?.email;
  if (!sessionUserId || !sessionEmail) {
    return mobileApi.unauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mobileApi.badRequest('Invalid JSON body');
  }

  const parsed = linkFirebaseBodySchema.safeParse(body);
  if (!parsed.success) {
    return mobileApi.badRequest(
      parsed.error.issues.map((issue) => issue.message).join('; ') || 'Validation error'
    );
  }

  let firebaseUid: string;
  const normalizedSessionEmail = normalizeEmail(sessionEmail);

  if ('code' in parsed.data) {
    const linkCode = parsed.data.code;
    type TxResult = { ok: true; alreadyLinked: boolean; firebaseUid: string };
    type TxError = { code: string };
    try {
      const result = await db.transaction(async (tx): Promise<TxResult> => {
        const claimed = await tx
          .delete(firebaseLinkCodes)
          .where(
            and(
              eq(firebaseLinkCodes.code, linkCode),
              gt(firebaseLinkCodes.expiresAt, new Date()),
              eq(firebaseLinkCodes.email, normalizedSessionEmail)
            )
          )
          .returning({ firebaseUid: firebaseLinkCodes.firebaseUid });

        if (claimed.length === 0) {
          const existingCode = await tx.query.firebaseLinkCodes.findFirst({
            where: and(
              eq(firebaseLinkCodes.code, linkCode),
              gt(firebaseLinkCodes.expiresAt, new Date())
            ),
            columns: { email: true },
          });
          if (existingCode && normalizeEmail(existingCode.email) !== normalizedSessionEmail) {
            throw { code: 'EMAIL_MISMATCH' } satisfies TxError;
          }
          throw { code: 'INVALID_OR_EXPIRED' } satisfies TxError;
        }

        const claimedFirebaseUid = claimed[0].firebaseUid;

        const user = await tx.query.users.findFirst({
          where: eq(users.id, sessionUserId),
          columns: { id: true, email: true, firebaseUid: true },
        });
        if (!user) throw { code: 'UNAUTHORIZED' } satisfies TxError;
        if (normalizeEmail(user.email) !== normalizedSessionEmail) throw { code: 'SESSION_EMAIL_MISMATCH' } satisfies TxError;

        if (user.firebaseUid) {
          if (user.firebaseUid === claimedFirebaseUid) {
            return { ok: true, alreadyLinked: true, firebaseUid: user.firebaseUid };
          }
          throw { code: 'ALREADY_LINKED_DIFFERENT' } satisfies TxError;
        }

        const existing = await tx.query.users.findFirst({
          where: and(eq(users.firebaseUid, claimedFirebaseUid), ne(users.id, user.id)),
          columns: { id: true },
        });
        if (existing) throw { code: 'FIREBASE_ALREADY_LINKED' } satisfies TxError;

        const [updated] = await tx
          .update(users)
          .set({ firebaseUid: claimedFirebaseUid, updatedAt: new Date() })
          .where(eq(users.id, user.id))
          .returning({ firebaseUid: users.firebaseUid });
        if (!updated?.firebaseUid) throw { code: 'UPDATE_FAILED' } satisfies TxError;
        return { ok: true, alreadyLinked: false, firebaseUid: updated.firebaseUid };
      });

      const payload = {
        linked: true as const,
        alreadyLinked: result.alreadyLinked,
        firebaseUid: result.firebaseUid,
      };
      const validated = linkFirebaseResponseSchema.safeParse(payload);
      if (!validated.success) {
        console.error('[POST /mobile/link-firebase] Response shape invalid:', validated.error.flatten());
        return mobileApi.serverError();
      }
      return jsonSuccess(validated.data);
    } catch (err) {
      const e = err as TxError;
      if (e?.code === 'EMAIL_MISMATCH') {
        return mobileApi.forbidden('Signed-in account email does not match the account that requested the link');
      }
      if (e?.code === 'INVALID_OR_EXPIRED') {
        return mobileApi.forbidden('Link code is invalid or expired');
      }
      if (e?.code === 'UNAUTHORIZED' || e?.code === 'SESSION_EMAIL_MISMATCH') {
        return mobileApi.forbidden('Session email does not match user record');
      }
      if (e?.code === 'ALREADY_LINKED_DIFFERENT') {
        return mobileApi.conflict('Account is already linked to a different Firebase user');
      }
      if (e?.code === 'FIREBASE_ALREADY_LINKED') {
        return mobileApi.conflict('This Firebase user is already linked to another account');
      }
      if (e?.code === 'UPDATE_FAILED') {
        return mobileApi.serverError('Unable to link Firebase account');
      }
      throw err;
    }
  } else {
    let decoded: Awaited<ReturnType<typeof verifyFirebaseIdToken>>;
    try {
      decoded = await verifyFirebaseIdToken(parsed.data.idToken);
    } catch {
      return mobileApi.forbidden('Invalid Firebase ID token');
    }
    const tokenEmail = decoded.email;
    if (!tokenEmail) {
      return mobileApi.forbidden('Firebase token is missing an email');
    }
    if (!decoded.email_verified) {
      return mobileApi.forbidden('Firebase email must be verified before linking');
    }
    if (normalizeEmail(tokenEmail) !== normalizedSessionEmail) {
      return mobileApi.forbidden('Signed-in account email does not match Firebase token email');
    }
    firebaseUid = decoded.uid;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, sessionUserId),
    columns: { id: true, email: true, firebaseUid: true },
  });
  if (!user) {
    return mobileApi.unauthorized();
  }
  if (normalizeEmail(user.email) !== normalizedSessionEmail) {
    return mobileApi.forbidden('Session email does not match user record');
  }

  if (user.firebaseUid) {
    if (user.firebaseUid === firebaseUid) {
      const payload = { linked: true as const, alreadyLinked: true, firebaseUid };
      const validated = linkFirebaseResponseSchema.safeParse(payload);
      if (!validated.success) {
        console.error('[POST /mobile/link-firebase] Response shape invalid:', validated.error.flatten());
        return mobileApi.serverError();
      }
      return jsonSuccess(validated.data);
    }
    return mobileApi.conflict('Account is already linked to a different Firebase user');
  }

  const existingFirebaseUid = await db.query.users.findFirst({
    where: and(eq(users.firebaseUid, firebaseUid), ne(users.id, user.id)),
    columns: { id: true },
  });
  if (existingFirebaseUid) {
    return mobileApi.conflict('This Firebase user is already linked to another account');
  }

  const [updated] = await db
    .update(users)
    .set({
      firebaseUid,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))
    .returning({ id: users.id, firebaseUid: users.firebaseUid });

  if (!updated?.firebaseUid) {
    return mobileApi.serverError('Unable to link Firebase account');
  }

  const payload = { linked: true as const, alreadyLinked: false, firebaseUid: updated.firebaseUid };
  const validated = linkFirebaseResponseSchema.safeParse(payload);
  if (!validated.success) {
    console.error('[POST /mobile/link-firebase] Response shape invalid:', validated.error.flatten());
    return mobileApi.serverError();
  }
  return jsonSuccess(validated.data);
}
