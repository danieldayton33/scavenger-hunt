'use server';

import { auth } from '@/auth/config';
import { db } from '@/db';
import { scavengerHunts } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { HuntFormData, HuntSchema } from '@/lib/schemas/hunt';

export async function createHunt(newHunt: HuntFormData) {
  const session = await auth();
  if (!session || session.user.role !== 'admin') throw new Error('Forbidden');

  const data = HuntSchema.parse(newHunt);
  try {
    const result = await db.insert(scavengerHunts).values({
      ...data,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      createdBy: session.user.id,
    });
    const { insertId } = result[0];
    revalidatePath('/admin/hunts');
    return {
      id: insertId,
    };
  } catch (error) {
    console.error('Error creating hunt:', error);
    throw new Error('Failed to create hunt');
  }
}
