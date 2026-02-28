/**
 * Mobile API auth: parse Bearer token, verify with Firebase Admin, map to Postgres user.
 * Returns null if missing/invalid token or user lookup fails (caller should return 401).
 */
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getFirebaseAdmin, verifyFirebaseIdToken } from './firebaseAdmin';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type AuthedMobileUser = {
  id: string;
  role: 'admin' | 'user';
  firebaseUid: string | null;
  email: string;
  name: string | null;
  image: string | null;
};

export type MobileAuthResult = {
  user: AuthedMobileUser;
  decodedToken: { uid: string; email?: string; name?: string; picture?: string };
};

export type MobileAuthError = { error: 'EMAIL_EXISTS' | 'LINK_REQUIRED' };

export async function getMobileUserFromRequest(
  request: Request
): Promise<MobileAuthResult | MobileAuthError | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  let decoded;
  try {
    decoded = await verifyFirebaseIdToken(token);
  } catch {
    return null;
  }

  const firebaseUid = decoded.uid;
  const normalizedEmail = decoded.email ? normalizeEmail(decoded.email) : `firebase_${firebaseUid}@placeholder.local`;
  let name = decoded.name ?? null;
  let image = decoded.picture ?? null;

  // Find existing user by firebaseUid
  const existing = await db.query.users.findFirst({
    where: eq(users.firebaseUid, firebaseUid),
    columns: { id: true, role: true, firebaseUid: true, email: true, name: true, image: true },
  });

  if (existing) {
    return {
      user: {
        id: existing.id,
        role: existing.role,
        firebaseUid: existing.firebaseUid,
        email: existing.email,
        name: existing.name,
        image: existing.image,
      },
      decodedToken: { uid: decoded.uid, email: decoded.email, name: decoded.name, picture: decoded.picture },
    };
  }

  // If an email-based account exists, require explicit linking flow. Use case-insensitive email match.
  if (decoded.email) {
    const existingByEmail = await db.query.users.findFirst({
      where: sql`lower(${users.email}) = ${normalizedEmail}`,
      columns: { id: true, role: true, firebaseUid: true, email: true, name: true, image: true },
    });

    if (existingByEmail) {
      if (existingByEmail.firebaseUid && existingByEmail.firebaseUid !== firebaseUid) {
        return { error: 'EMAIL_EXISTS' };
      }
      if (!existingByEmail.firebaseUid) {
        return { error: 'LINK_REQUIRED' };
      }
    }
  }

  // New user: if token didn't provide name/image, fetch from Firebase Auth (avoids race after updateDisplayName)
  if (!name?.trim() || !image) {
    try {
      const userRecord = await getFirebaseAdmin().auth().getUser(firebaseUid);
      if (userRecord.displayName?.trim()) name = userRecord.displayName.trim();
      if (userRecord.photoURL) image = userRecord.photoURL;
    } catch {
      // Keep token-derived values; proceed with insert
    }
  }

  // Get-or-create: insert then select (idempotent via unique on firebaseUid). Store normalized email.
  try {
    const [inserted] = await db
      .insert(users)
      .values({
        firebaseUid,
        email: normalizedEmail,
        name,
        image,
        role: 'user',
      })
      .onConflictDoNothing({ target: [users.firebaseUid] })
      .returning({ id: users.id, role: users.role, firebaseUid: users.firebaseUid, email: users.email, name: users.name, image: users.image });

    if (inserted) {
      return {
        user: {
          id: inserted.id,
          role: inserted.role as 'admin' | 'user',
          firebaseUid: inserted.firebaseUid,
          email: inserted.email,
          name: inserted.name,
          image: inserted.image,
        },
        decodedToken: { uid: decoded.uid, email: decoded.email, name: decoded.name, picture: decoded.picture },
      };
    }

    // Conflict on firebaseUid: another request created the user; fetch
    const found = await db.query.users.findFirst({
      where: eq(users.firebaseUid, firebaseUid),
      columns: { id: true, role: true, firebaseUid: true, email: true, name: true, image: true },
    });
    if (found) {
      return {
        user: {
          id: found.id,
          role: found.role as 'admin' | 'user',
          firebaseUid: found.firebaseUid,
          email: found.email,
          name: found.name,
          image: found.image,
        },
        decodedToken: { uid: decoded.uid, email: decoded.email, name: decoded.name, picture: decoded.picture },
      };
    }
  } catch (e: unknown) {
    const raw = (e as { cause?: unknown })?.cause ?? e;
    const err = raw as { code?: string; constraint?: string; detail?: string };
    // Postgres unique violation (23505); real error may be on .cause
    if (err?.code === '23505') {
      if (err?.constraint === 'users_email_unique') return { error: 'LINK_REQUIRED' };
      if (typeof err?.detail === 'string' && err.detail.includes('(email)=')) return { error: 'LINK_REQUIRED' };
    }
    console.error('mobileAuth getOrCreate error:', e);
  }

  return null;
}
