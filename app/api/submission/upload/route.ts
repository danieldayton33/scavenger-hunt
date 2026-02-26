import { NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { uploadToStorage, isAllowedImageType } from '@/lib/firebaseStorage';

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * User submission image upload. Stores under user/{userId}/{huntId}/imageurl_*
 * so cleanup can target a user's hunt folder later.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Missing or invalid file. Use field name "file".' },
        { status: 400 }
      );
    }

    const huntId = formData.get('huntId');
    if (huntId == null || String(huntId).trim() === '') {
      return NextResponse.json(
        { error: 'Missing huntId.' },
        { status: 400 }
      );
    }

    const contentType = file.type || 'image/jpeg';
    if (!isAllowedImageType(contentType)) {
      return NextResponse.json(
        { error: `Invalid file type: ${contentType}. Use JPEG, PNG, WebP, or GIF.` },
        { status: 400 }
      );
    }

    const ext = EXT_BY_TYPE[contentType] ?? 'jpg';
    const timestamp = Date.now();
    const safeHuntId = String(huntId).replace(/[^a-z0-9-_]/gi, '_');
    const path = `user/${session.user.id}/${safeHuntId}/imageurl_${timestamp}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToStorage(path, buffer, contentType);

    return NextResponse.json({ url });
  } catch (err) {
    console.error('Submission upload error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
