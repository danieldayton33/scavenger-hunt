/**
 * Upload a file to Firebase Storage and return its download URL.
 * Uses the same Firebase Admin app as auth (Node runtime only).
 */
import { getStorage, getDownloadURL } from 'firebase-admin/storage';
import { getFirebaseAdmin } from './firebaseAdmin';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function isAllowedImageType(contentType: string): boolean {
  return ALLOWED_CONTENT_TYPES.includes(contentType);
}

export async function uploadToStorage(
  path: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (!isAllowedImageType(contentType)) {
    throw new Error(`Invalid content type: ${contentType}. Allowed: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
  }

  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucketName?.trim()) {
    throw new Error(
      'FIREBASE_STORAGE_BUCKET is not set. Set it in your environment (e.g. .env) to your Firebase Storage bucket (e.g. your-project.firebasestorage.app).'
    );
  }

  const app = getFirebaseAdmin();
  const bucket = getStorage(app).bucket(bucketName);
  const file = bucket.file(path);

  await file.save(buffer, {
    resumable: false,
    metadata: { contentType },
    predefinedAcl: 'publicRead',
  });

  return getDownloadURL(file);
}
