'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { HuntFormData, HuntSchema } from '@/lib/schemas/hunt';
import { eq } from 'drizzle-orm';

export async function updateHunt(updatedHunt: HuntFormData) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') throw new Error('Forbidden');

  const data = HuntSchema.parse(updatedHunt);
  try {
    await db
      .update(scavengerHunts)
      .set({
        ...data,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
      })
      .where(eq(scavengerHunts.slug, data.slug));
    revalidatePath('/admin/hunts');
    return { id: data.slug };
  } catch (error) {
    console.error('Error updating hunt:', error);
    throw new Error('Failed to update hunt');
  }
}
