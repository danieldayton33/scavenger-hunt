import { NextResponse } from 'next/server';
import { auth } from '@/auth/config';
import { uploadToStorage, isAllowedImageType } from '@/lib/firebaseStorage';

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Missing or invalid file. Use field name "file".' },
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

    const type = (formData.get('type') as string) || 'hunt-item';
    const ext = EXT_BY_TYPE[contentType] ?? 'jpg';
    const timestamp = Date.now();

    let path: string;
    if (type === 'hunt') {
      const slug = (formData.get('slug') as string) || 'hunt';
      const safeSlug = slug.replace(/[^a-z0-9-]/gi, '_');
      path = `admin/hunts/${safeSlug}_${timestamp}.${ext}`;
    } else {
      const huntId = (formData.get('huntId') as string) || '0';
      const itemId = (formData.get('itemId') as string) || 'new';
      path = `admin/hunt-items/${huntId}_${itemId}_${timestamp}.${ext}`;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToStorage(path, buffer, contentType);

    return NextResponse.json({ url });
  } catch (err) {
    console.error('Admin upload error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
