'use server';
import { auth } from '@/auth/config';
import { db } from '@/db';
import { huntItems } from '@/db/schema';
import { revalidateTag } from 'next/cache';
import { eq } from 'drizzle-orm';

const deleteHuntItem = async (
  huntItemId: number
): Promise<
  | number
  | {
      error: string;
    }
> => {
  const session = await auth();
  if (!session || session.user.role !== 'admin') throw new Error('Forbidden');
  try {
    const existingHuntItem = await db.query.huntItems.findFirst({
      where: eq(huntItems.id, huntItemId),
    });
    if (!existingHuntItem) {
      return { error: 'Hunt item not found' };
    }

    await db.delete(huntItems).where(eq(huntItems.id, huntItemId));

    revalidateTag(`hunt-${existingHuntItem.huntId}`);
    return huntItemId;
  } catch (error) {
    console.error('Error deleting hunt item', error);
    return { error: 'Failed to delete hunt item' };
  }
};

export default deleteHuntItem;
