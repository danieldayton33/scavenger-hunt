'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { huntItems } from '@/db/schema';
import { revalidateTag } from 'next/cache';
import { HuntItemFormData, HuntItemSchema } from '@/lib/schemas/huntItem';
import { ScavengerHunt } from '@/lib/schemas/hunt';

const createHuntItem = async ({
  huntItem,
  hunt,
}: {
  huntItem: HuntItemFormData;
  hunt: ScavengerHunt;
}) => {
  const session = await auth();
  if (!session || session.user.role !== 'admin') throw new Error('Forbidden');
  const data = HuntItemSchema.parse(huntItem);
  try {
    const result = await db
      .insert(huntItems)
      .values({
        ...data,
        huntId: hunt.id,
      })
      .returning();
    const { id } = result[0];
    revalidateTag(`hunt-${hunt.slug}`);
    return {
      id,
    };
  } catch (error) {
    console.error('Error creating huntItem', error);
    throw new Error('Failed to create hunt item');
  }
};

export default createHuntItem;
