'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { huntItems } from '@/db/schema';
import { revalidateTag } from 'next/cache';
import { HuntItemFormData, HuntItemSchema } from '@/lib/schemas/huntItem';
import { eq } from 'drizzle-orm';
import { ScavengerHunt } from '@/lib/schemas/hunt';

export const updatedHuntItem = async ({
  huntItem,
  huntItemId,
  hunt,
}: {
  huntItem: HuntItemFormData;
  huntItemId: number;
  hunt: ScavengerHunt;
}) => {
  const session = await auth();
  if (!session || session.user.role !== 'admin') throw new Error('Forbidden');
  const data = HuntItemSchema.parse(huntItem);
  try {
    const existingHuntItem = await db.query.huntItems.findFirst({
      where: eq(huntItems.id, huntItemId),
    });
    if (!existingHuntItem) throw new Error('Hunt item not found');

    await db
      .update(huntItems)
      .set({
        ...data,
      })
      .where(eq(huntItems.id, huntItemId));

    revalidateTag(`hunt-${hunt.slug}`, 'max');
    return {
      id: huntItemId,
    };
  } catch (error) {
    console.error('Error updating hunt item', error);
    throw new Error('Failed to update hunt item');
  }
};

export default updatedHuntItem;
